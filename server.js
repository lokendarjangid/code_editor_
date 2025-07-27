const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const express = require('express');
const cors = require('cors');
const CodeExecutor = require('./utils/codeExecutor');
const sessionStore = require('./utils/fileSessionStore');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const expressApp = express();

const PORT = process.env.PORT || 3000;

// Create code executor instance
const codeExecutor = new CodeExecutor();

// Express middleware
expressApp.use(cors());
expressApp.use(express.json({ limit: '50mb' }));

app.prepare().then(() => {
    // Only handle socket.io and let Next.js handle all HTTP routes (including API)
    const server = createServer((req, res) => {
        handle(req, res);
    });

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Store participants and session data locally
    const participants = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // ...existing socket.io event handlers...
        // Join a session room
        socket.on('join-session', async (data) => {
            console.log('=== JOIN SESSION START ===');
            console.log('Received join-session data:', JSON.stringify(data, null, 2));

            const { roomCode, participant } = data;

            // Get session from local storage
            let session = sessionStore.get(roomCode);
            console.log('Retrieved session:', JSON.stringify({
                hostId: session?.hostId,
                participantsCount: session?.participants ? Object.keys(session.participants).length : 0,
                isEmpty: session?.isEmpty
            }, null, 2));

            if (!session) {
                console.error('Session not found:', roomCode);
                socket.emit('session-error', { error: 'Session Not Found' });
                socket.disconnect();
                return;
            }

            socket.join(roomCode);
            socket.roomCode = roomCode;

            // Maintain participants locally for socket.io
            if (!session.participants) session.participants = {};

            // If session was empty, reset the empty flag and update activity
            if (session.isEmpty) {
                session.isEmpty = false;
                session.lastActivity = new Date().toISOString();
                console.log(`Session ${roomCode} reactivated - participant rejoined`);
            }

            // Set hostId if this is the first participant to join or if host is rejoining
            const hasNoHost = !session.hostId || session.hostId === null;
            const isFirstParticipant = Object.keys(session.participants).length === 0;
            const isEmptySession = session.isEmpty;

            console.log(`Host assignment check: hasNoHost=${hasNoHost}, isFirstParticipant=${isFirstParticipant}, isEmptySession=${isEmptySession}`);

            if (hasNoHost && (isFirstParticipant || isEmptySession)) {
                session.hostId = participant.id;
                console.log(`Setting ${participant.name} (ID: ${participant.id}) as host for session ${roomCode}`);
            } else {
                console.log(`Not setting host: hostId=${session.hostId}, participants=${Object.keys(session.participants).length}, isEmpty=${session.isEmpty}`);
            }

            // Check if this user is the host
            const isHost = participant.id === session.hostId;
            console.log(`Host check: participant.id=${participant.id}, session.hostId=${session.hostId}, isHost=${isHost}`);

            // Set edit permissions based on host status and edit mode
            let canEdit = false;
            if (isHost) {
                canEdit = true; // Host can always edit
            } else if (session.editMode === 'collaborative') {
                canEdit = true; // Everyone can edit in collaborative mode
            } else {
                canEdit = false; // Only host can edit in host-only mode
            }

            // Add participant with proper permissions
            const participantWithPermissions = {
                ...participant,
                isHost,
                canEdit
            };

            // Store participant info for socket
            socket.participant = participantWithPermissions;
            session.participants[socket.id] = participantWithPermissions;
            participants.set(socket.id, { ...participantWithPermissions, roomCode });

            // Update session in storage
            sessionStore.set(roomCode, session);

            // Notify others about new participant
            socket.to(roomCode).emit('participant-joined', {
                participant: participantWithPermissions,
                participants: Object.values(session.participants),
                hostId: session.hostId
            });

            // Send current session state to the new participant
            socket.emit('session-state', {
                participants: Object.values(session.participants),
                comments: session.comments || [],
                code: session.code || '',
                editMode: session.editMode || 'host-only',
                hostId: session.hostId,
                isHost,
                canEdit
            });

            console.log(`${participant.name} joined room ${roomCode} as ${isHost ? 'host' : 'participant'} with ${canEdit ? 'edit' : 'view'} permissions`);
            console.log(`Session hostId: ${session.hostId}, Participant ID: ${participant.id}, isHost: ${isHost}`);
        });

        // Handle code changes
        socket.on('code-change', async (data) => {
            const { roomCode, code } = data;
            console.log(`Code change received for room ${roomCode}, code length: ${code.length}`);

            // Check if user has permission to edit
            const session = sessionStore.get(roomCode);
            if (!session) {
                console.error('Session not found for code update:', roomCode);
                socket.emit('error', { message: 'Session not found' });
                return;
            }

            const participant = session.participants[socket.id];
            if (!participant) {
                console.error('Participant not found for code update:', socket.id);
                socket.emit('error', { message: 'Participant not found' });
                return;
            }

            // Check edit permissions
            const isHost = participant.id === session.hostId;
            const canEdit = isHost || (session.editMode === 'collaborative' && participant.canEdit);

            if (!canEdit) {
                console.log(`Code change rejected for ${participant.name} - no edit permission`);
                socket.emit('error', { message: 'No edit permission' });
                return;
            }

            // Update code in session directly
            try {
                session.code = code;
                sessionStore.set(roomCode, session);
                console.log(`Broadcasting code-updated to room ${roomCode} by ${participant.name}`);
                socket.to(roomCode).emit('code-updated', { code });
            } catch (error) {
                console.error('Error updating code:', error);
            }
        });

        // Handle new comments
        socket.on('new-comment', async (data) => {
            const { roomCode, comment } = data;

            // Add comment to session directly
            try {
                const session = sessionStore.get(roomCode);
                if (session) {
                    session.comments = session.comments || [];
                    session.comments.push(comment);
                    sessionStore.set(roomCode, session);
                    // Broadcast to all participants in the room
                    io.to(roomCode).emit('comment-added', { comment });
                    console.log(`New comment in ${roomCode} by ${comment.author}`);
                } else {
                    console.error('Session not found for comment:', roomCode);
                }
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        });

        // Handle comment voting
        socket.on('vote-comment', async (data) => {
            const { roomCode, commentId, voterId } = data;

            // Update comment votes in session directly
            try {
                const session = sessionStore.get(roomCode);
                if (session) {
                    session.comments = session.comments || [];
                    const comment = session.comments.find(c => c.id === commentId);
                    if (comment && !comment.voters.includes(voterId)) {
                        comment.votes += 1;
                        comment.voters.push(voterId);
                        sessionStore.set(roomCode, session);
                        // Broadcast vote update
                        io.to(roomCode).emit('comment-voted', {
                            commentId,
                            votes: comment.votes,
                            participants: session.participants ? Object.values(session.participants) : []
                        });
                    }
                } else {
                    console.error('Session not found for voting:', roomCode);
                }
            } catch (error) {
                console.error('Error voting on comment:', error);
            }
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            const { roomCode, isTyping } = data;
            socket.to(roomCode).emit('user-typing', {
                userId: socket.id,
                participantName: socket.participant?.name,
                isTyping
            });
        });

        // Handle code execution requests
        socket.on('execute-code', async (data) => {
            const { roomCode, code, language } = data;

            try {
                const result = await codeExecutor.executeCode(code, language);

                // Broadcast execution result to all participants in the room
                io.to(roomCode).emit('code-execution-result', {
                    executedBy: socket.participant?.name || 'Unknown',
                    result,
                    timestamp: new Date().toISOString()
                });

                console.log(`Code executed in ${roomCode} by ${socket.participant?.name}`);
            } catch (error) {
                socket.emit('code-execution-error', {
                    error: error.message
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            const participant = participants.get(socket.id);

            if (participant && socket.roomCode) {
                // Update session in local storage
                try {
                    const session = sessionStore.get(socket.roomCode);
                    if (session && session.participants && session.participants[socket.id]) {
                        delete session.participants[socket.id];
                        sessionStore.set(socket.roomCode, session);

                        // Notify others about participant leaving
                        socket.to(socket.roomCode).emit('participant-left', {
                            participantId: socket.id,
                            participants: Object.values(session.participants)
                        });
                        console.log(`${participant.name} left room ${socket.roomCode}`);

                        // Clean up empty sessions - but keep session data for potential rejoins
                        if (Object.keys(session.participants).length === 0) {
                            // Mark session as empty but don't delete immediately
                            session.lastActivity = new Date().toISOString();
                            session.isEmpty = true;
                            sessionStore.set(socket.roomCode, session);
                            console.log(`Session ${socket.roomCode} marked as empty - keeping for potential rejoins`);
                        }
                    }
                } catch (error) {
                    console.error('Error handling disconnect:', error);
                }
            }

            participants.delete(socket.id);
            console.log('User disconnected:', socket.id);
        });

        // Handle edit mode changes
        socket.on('toggle-edit-mode', async (data) => {
            const { roomCode, editMode } = data;

            try {
                const session = sessionStore.get(roomCode);
                const isHost = session && socket.participant && socket.participant.id === session.hostId;

                if (session && isHost) {
                    session.editMode = editMode;

                    // Update all participants' edit permissions based on new mode
                    Object.keys(session.participants).forEach(socketId => {
                        const participant = session.participants[socketId];
                        const participantIsHost = participant.id === session.hostId;

                        if (participantIsHost) {
                            participant.canEdit = true; // Host can always edit
                        } else if (editMode === 'collaborative') {
                            participant.canEdit = true; // Everyone can edit in collaborative mode
                        } else {
                            participant.canEdit = false; // Only host can edit in host-only mode
                        }
                    });

                    sessionStore.set(roomCode, session);

                    // Broadcast edit mode change to all participants
                    io.to(roomCode).emit('edit-mode-changed', {
                        editMode,
                        hostId: session.hostId,
                        participants: Object.values(session.participants)
                    });

                    console.log(`Edit mode changed to ${editMode} in ${roomCode} by host`);
                } else {
                    socket.emit('error', { message: 'Only host can change edit mode' });
                }
            } catch (error) {
                console.error('Error toggling edit mode:', error);
            }
        });

        // Handle individual participant edit permission changes
        socket.on('toggle-participant-edit', async (data) => {
            const { roomCode, participantId, canEdit } = data;

            try {
                const session = sessionStore.get(roomCode);
                if (session && socket.participant?.isHost) {
                    if (session.participants[participantId]) {
                        session.participants[participantId].canEdit = canEdit;
                        sessionStore.set(roomCode, session);

                        // Broadcast participant permission change
                        io.to(roomCode).emit('participant-edit-changed', {
                            participantId,
                            canEdit,
                            participants: Object.values(session.participants)
                        });

                        console.log(`Edit permission ${canEdit ? 'granted' : 'revoked'} for participant ${participantId} in ${roomCode}`);
                    }
                } else {
                    socket.emit('error', { message: 'Only host can change participant permissions' });
                }
            } catch (error) {
                console.error('Error toggling participant edit permission:', error);
            }
        });

        // Session management
        socket.on('end-session', async (data) => {
            const { roomCode } = data;

            // Delete session from local storage
            sessionStore.delete(roomCode);
            // Notify all participants
            io.to(roomCode).emit('session-ended');
            console.log(`Session ${roomCode} ended by host`);
        });
    });

    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);

        // Clean up empty sessions every 5 minutes
        setInterval(() => {
            sessionStore.cleanup();
        }, 5 * 60 * 1000);
    });
});

// Export sessionStore for API routes
module.exports = { sessionStore };

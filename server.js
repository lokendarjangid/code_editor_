const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const express = require('express');
const cors = require('cors');
const CodeExecutor = require('./utils/codeExecutor');

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
    // Code execution endpoint
    expressApp.post('/api/execute', async (req, res) => {
        try {
            const { code, language } = req.body;

            if (!code || !language) {
                return res.status(400).json({
                    success: false,
                    error: 'Code and language are required'
                });
            }

            const result = await codeExecutor.executeCode(code, language);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });


    // Handle malformed URLs
    expressApp.use((req, res, next) => {
        try {
            decodeURIComponent(req.url);
            next();
        } catch (err) {
            res.status(400).send('Bad URL');
        }
    });

    // Fallback: let Next.js handle all other routes
    expressApp.use((req, res) => {
        return handle(req, res);
    });



    const server = createServer(expressApp);

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Store active sessions and participants
    const sessions = new Map();
    const participants = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a session room
        socket.on('join-session', (data) => {
            const { roomCode, participant } = data;

            // Only allow join if session exists
            if (!sessions.has(roomCode)) {
                socket.emit('session-error', { error: 'Session Not Found' });
                socket.disconnect();
                return;
            }

            socket.join(roomCode);
            socket.roomCode = roomCode;
            socket.participant = participant;

            const session = sessions.get(roomCode);
            session.participants.set(socket.id, participant);
            participants.set(socket.id, { ...participant, roomCode });

            // Notify others about new participant
            socket.to(roomCode).emit('participant-joined', {
                participant,
                participants: Array.from(session.participants.values())
            });

            // Send current session state to the new participant
            socket.emit('session-state', {
                participants: Array.from(session.participants.values()),
                comments: session.comments,
                code: session.code
            });

            console.log(`${participant.name} joined room ${roomCode}`);
        });

        // Handle code changes
        socket.on('code-change', (data) => {
            const { roomCode, code } = data;

            if (sessions.has(roomCode)) {
                sessions.get(roomCode).code = code;
                socket.to(roomCode).emit('code-updated', { code });
            }
        });

        // Handle new comments
        socket.on('new-comment', (data) => {
            const { roomCode, comment } = data;

            if (sessions.has(roomCode)) {
                const session = sessions.get(roomCode);
                session.comments.push(comment);

                // Broadcast to all participants in the room
                io.to(roomCode).emit('comment-added', { comment });

                console.log(`New comment in ${roomCode} by ${comment.author}`);
            }
        });

        // Handle comment voting
        socket.on('vote-comment', (data) => {
            const { roomCode, commentId, voterId } = data;

            if (sessions.has(roomCode)) {
                const session = sessions.get(roomCode);
                const comment = session.comments.find(c => c.id === commentId);

                if (comment && !comment.voters.includes(voterId)) {
                    comment.votes += 1;
                    comment.voters.push(voterId);

                    // Update participant score
                    const commenter = session.participants.get(
                        Array.from(session.participants.entries())
                            .find(([_, p]) => p.id === comment.authorId)?.[0]
                    );

                    if (commenter) {
                        commenter.votesReceived += 1;
                        commenter.score = commenter.votesReceived * 2 + commenter.commentsCount;
                    }

                    // Broadcast vote update
                    io.to(roomCode).emit('comment-voted', {
                        commentId,
                        votes: comment.votes,
                        participants: Array.from(session.participants.values())
                    });
                }
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
        socket.on('disconnect', () => {
            const participant = participants.get(socket.id);

            if (participant && socket.roomCode) {
                const session = sessions.get(socket.roomCode);

                if (session) {
                    session.participants.delete(socket.id);

                    // Notify others about participant leaving
                    socket.to(socket.roomCode).emit('participant-left', {
                        participantId: socket.id,
                        participants: Array.from(session.participants.values())
                    });

                    console.log(`${participant.name} left room ${socket.roomCode}`);

                    // Clean up empty sessions
                    if (session.participants.size === 0) {
                        sessions.delete(socket.roomCode);
                        console.log(`Session ${socket.roomCode} closed - no participants`);
                    }
                }
            }

            participants.delete(socket.id);
            console.log('User disconnected:', socket.id);
        });

        // Session management
        socket.on('end-session', (data) => {
            const { roomCode } = data;

            if (sessions.has(roomCode)) {
                // Notify all participants
                io.to(roomCode).emit('session-ended');

                // Clean up
                sessions.delete(roomCode);
                console.log(`Session ${roomCode} ended by host`);
            }
        });
    });

    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import CodeEditor from '../../../components/CodeEditor';
import CommentSection from '../../../components/CommentSection';
import ParticipantsList from '../../../components/ParticipantsList';
import SessionTimer from '../../../components/SessionTimer';
import HelpTutorial from '../../../components/HelpTutorial';
import CodeExecutionPanel from '../../../components/CodeExecutionPanel';

export default function SessionRoom() {
    const params = useParams();
    const router = useRouter();
    const { roomCode } = params;
    const socketRef = useRef(null);

    const [session, setSession] = useState(null);
    const [participant, setParticipant] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [code, setCode] = useState('// Welcome to Peer Rank Code Review!\n// Start reviewing and commenting on the code below\n\nfunction exampleFunction() {\n    console.log("Hello, World!");\n    return true;\n}');
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [showMobilePanel, setShowMobilePanel] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [editMode, setEditMode] = useState('host-only'); // 'host-only' or 'collaborative'

    // Refs to store current values for socket handlers
    const sessionRef = useRef(session);
    const participantsRef = useRef(participants);
    const commentsRef = useRef(comments);

    // Update refs when state changes
    useEffect(() => {
        sessionRef.current = session;
    }, [session]);

    useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);

    useEffect(() => {
        commentsRef.current = comments;
    }, [comments]);

    // Check if user has seen tutorial
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('peer-rank-tutorial-shown');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    // Initialize socket connection
    useEffect(() => {
        // Clean up any existing socket connection
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        socketRef.current = io({
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnectionDelay: 1000,
            reconnection: true,
            reconnectionAttempts: 5,
            maxReconnectionAttempts: 5
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to server');
        });

        socketRef.current.on('disconnect', (reason) => {
            setIsConnected(false);
            console.log('Disconnected from server:', reason);
            // Don't redirect on development disconnects or client-side disconnects
            if (reason === 'io server disconnect') {
                console.log('Server disconnected the client');
                // Only redirect if this is an intentional server disconnect
                // setTimeout(() => router.push('/'), 2000);
            } else if (reason === 'transport close' || reason === 'transport error') {
                console.log('Connection lost, likely due to development hot reload');
                // Don't redirect, let reconnection handle it
            }
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        socketRef.current.on('session-error', (data) => {
            console.error('Session error:', data.error);
            router.push('/');
        });

        socketRef.current.on('session-state', (data) => {
            console.log('Session state received:', data);
            setParticipants(data.participants || []);
            setComments(data.comments || []);
            if (data.code) {
                setCode(data.code);
            }

            // Set edit permissions and host status from server response
            setEditMode(data.editMode || 'host-only');

            // Handle host assignment with fallback logic
            let actualIsHost = data.isHost || false;
            let actualHostId = data.hostId;

            // Fallback: if no hostId is set and this is the first/only participant, make them host
            if (!actualHostId && data.participants && data.participants.length === 1 && participant) {
                actualIsHost = true;
                actualHostId = participant.id;
                console.log('Fallback: Setting first participant as host');
            }

            setIsHost(actualIsHost);
            setCanEdit(data.canEdit || actualIsHost); // Host can always edit

            // Update session with hostId from server or fallback
            setSession(prevSession => ({
                ...prevSession,
                hostId: actualHostId,
                editMode: data.editMode || 'host-only'
            }));

            console.log('Session state processed:', {
                isHost: actualIsHost,
                canEdit: data.canEdit || actualIsHost,
                editMode: data.editMode || 'host-only',
                hostId: actualHostId,
                participantsCount: data.participants?.length || 0
            });
        });

        socketRef.current.on('participant-joined', (data) => {
            setParticipants(data.participants);
            // Update session with hostId if provided
            if (data.hostId) {
                setSession(prevSession => ({
                    ...prevSession,
                    hostId: data.hostId
                }));
            }
            console.log('Participant joined, participants updated:', data.participants.length, 'hostId:', data.hostId);
        });

        socketRef.current.on('edit-mode-changed', (data) => {
            const { editMode, hostId, participants } = data;
            setEditMode(editMode); // Update the editMode state

            // Update participants list with new permissions
            if (participants) {
                setParticipants(participants);
            }

            // Update current user's permissions
            if (participant) {
                const isHostUser = hostId === participant.id;
                setIsHost(isHostUser);

                // Find current user in updated participants to get their canEdit status
                const currentUserInParticipants = participants?.find(p => p.id === participant.id);
                if (currentUserInParticipants) {
                    setCanEdit(currentUserInParticipants.canEdit);
                    console.log('Edit mode changed:', editMode, 'canEdit:', currentUserInParticipants.canEdit);
                } else {
                    // Fallback logic
                    if (editMode === 'collaborative') {
                        setCanEdit(true);
                    } else {
                        setCanEdit(isHostUser);
                    }
                    console.log('Edit mode changed (fallback):', editMode, 'canEdit:', editMode === 'collaborative' || isHostUser);
                }
            }
        });

        socketRef.current.on('participant-edit-changed', (data) => {
            const { participantId, canEdit: newCanEdit, participants: updatedParticipants } = data;
            if (participant && participant.id === participantId) {
                setCanEdit(newCanEdit);
            }
            // Update participants list with new permissions
            if (updatedParticipants) {
                setParticipants(updatedParticipants);
            }
        });

        socketRef.current.on('participant-left', (data) => {
            setParticipants(data.participants);
        });

        socketRef.current.on('code-updated', (data) => {
            console.log('Received code-updated:', data.code.substring(0, 50) + '...');
            setCode(data.code);
        });

        socketRef.current.on('comment-added', (data) => {
            setComments(prev => [...prev, data.comment]);
        });

        socketRef.current.on('comment-voted', (data) => {
            setComments(prev => prev.map(comment =>
                comment.id === data.commentId
                    ? { ...comment, votes: data.votes }
                    : comment
            ));
            setParticipants(data.participants);
        });

        socketRef.current.on('user-typing', (data) => {
            setTypingUsers(prev => {
                const filtered = prev.filter(user => user.userId !== data.userId);
                if (data.isTyping) {
                    return [...filtered, data];
                }
                return filtered;
            });
        });

        socketRef.current.on('session-ended', async () => {
            // Get current state values from refs
            const currentSession = sessionRef.current;
            const currentParticipants = participantsRef.current;
            const currentComments = commentsRef.current;

            // Save session data to localStorage for summary page
            const sessionData = {
                ...currentSession,
                participants: currentParticipants,
                comments: currentComments,
                endedAt: new Date().toISOString()
            };

            // Save to localStorage for summary page access
            localStorage.setItem(`session_${roomCode}`, JSON.stringify(sessionData));
            localStorage.setItem(`comments_${roomCode}`, JSON.stringify(currentComments));

            // Also try to save to server
            try {
                await fetch('/api/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomCode, sessionData })
                });
            } catch (e) {
                console.warn('Failed to save session data to server:', e);
            }

            // Redirect to summary
            router.push(`/summary/${roomCode}`);
        });

        return () => {
            if (socketRef.current) {
                console.log('Cleaning up socket connection');
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [roomCode, router]);

    useEffect(() => {
        // Fetch session data from server
        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/session?roomCode=${roomCode}`);
                const data = await res.json();
                if (data.success && data.session) {
                    setSession(data.session);
                    // Set edit mode from session or default to 'host-only'
                    setEditMode(data.session.editMode || 'host-only');
                    // Use existing session code, or fallback to sample code
                    if (data.session.code) {
                        setCode(data.session.code);
                    } else {
                        const sampleCode = getSampleCode(data.session.language);
                        setCode(sampleCode);
                    }
                    // Set existing comments if any
                    if (data.session.comments) {
                        setComments(data.session.comments);
                    }
                } else {
                    console.error('Session not found:', data.error);
                    router.push('/');
                }
            } catch (err) {
                console.error('Error fetching session:', err);
                router.push('/');
            }
            setIsLoading(false);
        };
        fetchSession();
    }, [roomCode, router]);

    const getSampleCode = (language) => {
        const samples = {
            javascript: "// Welcome to Peer Rank Code Review!\n// Start reviewing and commenting on the code below\n\nfunction greetUser(name) {\n    if (!name) {\n        return \"Hello, Guest!\";\n    }\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greetUser(\"World\"));",
            python: "# Welcome to Peer Rank Code Review!\n# Start reviewing and commenting on the code below\n\ndef greet_user(name):\n    if not name:\n        return \"Hello, Guest!\"\n    return f\"Hello, {name}!\"\n\nprint(greet_user(\"World\"))",
            java: "// Welcome to Peer Rank Code Review!\n// Start reviewing and commenting on the code below\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(greetUser(\"World\"));\n    }\n    \n    public static String greetUser(String name) {\n        if (name == null || name.isEmpty()) {\n            return \"Hello, Guest!\";\n        }\n        return \"Hello, \" + name + \"!\";\n    }\n}",
            cpp: "// Welcome to Peer Rank Code Review!\n// Start reviewing and commenting on the code below\n\n#include <iostream>\n#include <string>\n\nstd::string greetUser(const std::string& name) {\n    if (name.empty()) {\n        return \"Hello, Guest!\";\n    }\n    return \"Hello, \" + name + \"!\";\n}\n\nint main() {\n    std::cout << greetUser(\"World\") << std::endl;\n    return 0;\n}",
            c: "// Welcome to Peer Rank Code Review!\n// Start reviewing and commenting on the code below\n\n#include <stdio.h>\n#include <string.h>\n\nvoid greetUser(char* result, const char* name) {\n    if (strlen(name) == 0) {\n        strcpy(result, \"Hello, Guest!\");\n    } else {\n        sprintf(result, \"Hello, %s!\", name);\n    }\n}\n\nint main() {\n    char greeting[100];\n    greetUser(greeting, \"World\");\n    printf(\"%s\\n\", greeting);\n    return 0;\n}"
        };
        return samples[language] || samples.javascript;
    };

    const handleJoinSession = (name) => {
        if (name.trim()) {
            setIsJoining(true);
            const newParticipant = {
                id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`, // More unique ID
                name: name.trim(),
                joinedAt: new Date().toISOString(),
                score: 0,
                commentsCount: 0,
                votesReceived: 0
            };

            console.log('Creating participant with ID:', newParticipant.id);
            setParticipant(newParticipant);
            setUserName(name.trim());

            // Temporary: Set as host if no participants yet (client-side fallback)
            if (participants.length === 0) {
                console.log('Client-side fallback: Setting as host (first participant)');
                setIsHost(true);
                setCanEdit(true);
            }

            // Let server determine host status and edit permissions
            // Join session via socket
            if (socketRef.current) {
                socketRef.current.emit('join-session', {
                    roomCode,
                    participant: newParticipant
                });
            }

            setIsJoining(false);
        }
    };

    const handleAddComment = (comment) => {
        if (participant && socketRef.current) {
            const newComment = {
                id: Date.now().toString(),
                text: comment,
                author: participant.name,
                authorId: participant.id,
                line: null,
                timestamp: new Date().toISOString(),
                votes: 0,
                voters: []
            };

            // Emit via socket for real-time sync
            socketRef.current.emit('new-comment', {
                roomCode,
                comment: newComment
            });

            // Update local participant stats
            const updatedParticipant = {
                ...participant,
                commentsCount: participant.commentsCount + 1
            };
            setParticipant(updatedParticipant);
        }
    };

    const handleVoteComment = (commentId) => {
        if (!participant || !socketRef.current) return;

        const comment = comments.find(c => c.id === commentId);
        if (comment && !comment.voters.includes(participant.id)) {
            socketRef.current.emit('vote-comment', {
                roomCode,
                commentId,
                voterId: participant.id
            });
        }
    };

    const handleToggleEditMode = () => {
        if (isHost && socketRef.current) {
            const newEditMode = editMode === 'host-only' ? 'collaborative' : 'host-only';
            socketRef.current.emit('toggle-edit-mode', {
                roomCode,
                editMode: newEditMode
            });
        }
    };

    const handleToggleParticipantEdit = (participantId, currentCanEdit) => {
        if (isHost && socketRef.current) {
            socketRef.current.emit('toggle-participant-edit', {
                roomCode,
                participantId,
                canEdit: !currentCanEdit
            });
        }
    };

    const handleCodeChange = (newCode) => {
        if (!canEdit) return; // Prevent editing if user doesn't have permission

        console.log('Code changed:', newCode.substring(0, 50) + '...');
        setCode(newCode);
        if (socketRef.current) {
            console.log('Emitting code-change to room:', roomCode);
            socketRef.current.emit('code-change', {
                roomCode,
                code: newCode
            });
        } else {
            console.error('Socket not connected when trying to emit code change');
        }
    };

    const handleEndSession = () => {
        if (socketRef.current) {
            // Save session data to localStorage before ending
            const sessionData = {
                ...sessionRef.current,
                participants: participantsRef.current,
                comments: commentsRef.current,
                endedAt: new Date().toISOString()
            };

            localStorage.setItem(`session_${roomCode}`, JSON.stringify(sessionData));
            localStorage.setItem(`comments_${roomCode}`, JSON.stringify(commentsRef.current));

            // Emit end session event
            socketRef.current.emit('end-session', { roomCode });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading session...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Session Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">The session with code "{roomCode}" does not exist.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!participant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Join Session</h1>
                        <p className="text-gray-600 dark:text-gray-300">Room Code: <span className="font-mono font-bold">{roomCode}</span></p>
                        {session && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{session.sessionName}</p>}
                        <div className="flex items-center justify-center mt-2">
                            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {isConnected ? 'Connected' : 'Connecting...'}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleJoinSession(userName);
                    }} className="space-y-4">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="userName"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your name..."
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isJoining || !isConnected}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isJoining ? 'Joining...' : 'Join Session'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            {/* Mobile-Optimized Header */}
            <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 px-3 lg:px-4 py-2 lg:py-3 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
                        <button
                            onClick={() => router.push('/')}
                            className="p-1 lg:p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {session?.sessionName || 'Code Review Session'}
                            </h1>
                            <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-mono">{roomCode}</span>
                                <span>•</span>
                                <span className="truncate">{session?.language || 'javascript'}</span>
                                <span className={`inline-flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                                    <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-1 lg:space-x-2">
                        <SessionTimer duration={session?.duration || 30} />

                        {/* Host Edit Mode Controls */}
                        {isHost && (
                            <button
                                onClick={handleToggleEditMode}
                                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${editMode === 'collaborative'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                    }`}
                                title={`Switch to ${editMode === 'collaborative' ? 'host-only' : 'collaborative'} mode`}
                            >
                                {editMode === 'collaborative' ? 'Collab' : 'Host'}
                            </button>
                        )}

                        {/* Debug: Force Host Button (remove in production) */}
                        {process.env.NODE_ENV === 'development' && !isHost && (
                            <button
                                onClick={() => {
                                    console.log('Force setting as host');
                                    setIsHost(true);
                                    setCanEdit(true);
                                }}
                                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-lg"
                                title="Debug: Force set as host"
                            >
                                🔧 Host
                            </button>
                        )}

                        <button
                            onClick={() => setShowTutorial(true)}
                            className="p-1 lg:p-2 bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm font-medium rounded-lg transition-colors"
                            title="Show tutorial"
                        >
                            ?
                        </button>
                        <button
                            onClick={handleEndSession}
                            className="p-1 lg:p-2 bg-red-600 hover:bg-red-700 text-white text-xs lg:text-sm font-medium rounded-lg transition-colors hidden sm:block"
                        >
                            End
                        </button>
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setShowMobilePanel(!showMobilePanel)}
                            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Welcome message - compact on mobile */}
                <div className="mt-1 lg:mt-2 text-xs lg:text-sm text-gray-600 dark:text-gray-300 truncate">
                    Welcome, <span className="font-semibold">{participant.name}</span>
                </div>

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                        {typingUsers.map(user => user.participantName).join(', ')} typing...
                    </div>
                )}
            </div>

            {/* Main Content - Mobile-First Design */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] lg:h-[calc(100vh-73px)]">
                {/* Code Editor */}
                <div className="flex-1 flex flex-col min-h-0 order-1">
                    <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 px-3 lg:px-4 py-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Code Review
                            </h2>
                            <div className="flex items-center space-x-2">
                                {/* Mobile panel toggle */}
                                <button
                                    onClick={() => setShowMobilePanel(!showMobilePanel)}
                                    className="lg:hidden text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md transition-colors"
                                >
                                    {showMobilePanel ? 'Hide Panel' : 'Show Panel'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <CodeEditor
                            code={code}
                            language={session?.language || 'javascript'}
                            onChange={handleCodeChange}
                            readOnly={!canEdit}
                        />
                    </div>
                </div>

                {/* Right Panel - Enhanced Mobile Experience */}
                <div className={`w-full lg:w-96 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col ${showMobilePanel ? 'order-2 h-96 lg:h-auto' : 'order-3 lg:order-2 h-0 lg:h-auto overflow-hidden lg:overflow-visible'
                    } lg:block transition-all duration-300 ease-in-out`}>

                    {/* Panel Content */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Code Execution Panel */}
                        <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-3 lg:p-4">
                            <CodeExecutionPanel
                                code={code}
                                language={session?.language || 'javascript'}
                                socketRef={socketRef}
                                roomCode={roomCode}
                            />
                        </div>

                        {/* Participants */}
                        <div className="border-b border-gray-200/50 dark:border-gray-700/50 max-h-32 lg:max-h-48 overflow-y-auto">
                            <ParticipantsList
                                participants={participants}
                                isHost={isHost}
                                hostId={session?.hostId}
                                onToggleParticipantEdit={handleToggleParticipantEdit}
                            />
                            {/* Debug info - remove in production */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="text-xs text-gray-500 p-2 border-t">
                                    Debug: isHost={isHost ? 'true' : 'false'}, hostId={session?.hostId || 'undefined'}, sessionHostId={session?.hostId}
                                </div>
                            )}
                        </div>

                        {/* Comments */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <CommentSection
                                comments={comments}
                                onAddComment={handleAddComment}
                                onVoteComment={handleVoteComment}
                                currentUserId={participant.id}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Tutorial */}
            {showTutorial && (
                <HelpTutorial onClose={() => setShowTutorial(false)} />
            )}
        </div>
    );
}

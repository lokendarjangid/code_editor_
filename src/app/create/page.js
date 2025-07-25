'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSession() {
    const [sessionConfig, setSessionConfig] = useState({
        language: 'javascript',
        duration: 30,
        maxParticipants: 10,
        sessionName: ''
    });
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const roomCode = generateRoomCode();

            // Store session configuration (in a real app, this would be sent to the backend)
            const sessionData = {
                ...sessionConfig,
                roomCode,
                createdAt: new Date().toISOString(),
                participants: [],
                status: 'waiting'
            };

            // For now, store in localStorage (in production, use a database)
            localStorage.setItem(`session_${roomCode}`, JSON.stringify(sessionData));

            // Redirect to the session room
            router.push(`/session/${roomCode}`);
        } catch (error) {
            console.error('Error creating session:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Create New Session
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Configure your code review session settings
                    </p>
                </div>

                {/* Create Session Form */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleCreateSession} className="space-y-6">
                            {/* Session Name */}
                            <div>
                                <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Session Name
                                </label>
                                <input
                                    type="text"
                                    id="sessionName"
                                    value={sessionConfig.sessionName}
                                    onChange={(e) => setSessionConfig({ ...sessionConfig, sessionName: e.target.value })}
                                    placeholder="Enter session name..."
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            {/* Programming Language */}
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Programming Language
                                </label>
                                <select
                                    id="language"
                                    value={sessionConfig.language}
                                    onChange={(e) => setSessionConfig({ ...sessionConfig, language: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="c">C</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="sql">SQL</option>
                                    <option value="json">JSON</option>
                                </select>
                            </div>

                            {/* Session Duration */}
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Session Duration (minutes)
                                </label>
                                <select
                                    id="duration"
                                    value={sessionConfig.duration}
                                    onChange={(e) => setSessionConfig({ ...sessionConfig, duration: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                </select>
                            </div>

                            {/* Max Participants */}
                            <div>
                                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Maximum Participants
                                </label>
                                <select
                                    id="maxParticipants"
                                    value={sessionConfig.maxParticipants}
                                    onChange={(e) => setSessionConfig({ ...sessionConfig, maxParticipants: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value={5}>5 participants</option>
                                    <option value={10}>10 participants</option>
                                    <option value={15}>15 participants</option>
                                    <option value={20}>20 participants</option>
                                </select>
                            </div>

                            {/* Create Button */}
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isCreating ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creating Session...
                                    </div>
                                ) : (
                                    'Create Session'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Card */}
                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                    How it works
                                </h3>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                    After creating the session, you'll get a unique room code. Share this code with participants so they can join your code review session. The session will start automatically when participants begin joining.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

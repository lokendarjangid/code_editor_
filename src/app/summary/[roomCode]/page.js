'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SessionSummary() {
    const params = useParams();
    const router = useRouter();
    const { roomCode } = params;

    const [session, setSession] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSessionData = async () => {
            // First try to load from localStorage
            const sessionData = localStorage.getItem(`session_${roomCode}`);
            const commentsData = localStorage.getItem(`comments_${roomCode}`);

            if (sessionData) {
                setSession(JSON.parse(sessionData));
            }

            if (commentsData) {
                setComments(JSON.parse(commentsData));
            }

            // If no local data, try to fetch from server
            if (!sessionData) {
                try {
                    const res = await fetch(`/api/session?roomCode=${roomCode}`);
                    const data = await res.json();
                    if (data.success && data.session) {
                        setSession(data.session);
                        if (data.session.comments) {
                            setComments(data.session.comments);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch session data from server:', error);
                }
            }

            setIsLoading(false);
        };

        loadSessionData();
    }, [roomCode]);

    const calculateStats = () => {
        if (!session || !comments) return null;

        const totalComments = comments.length;
        const totalVotes = comments.reduce((sum, comment) => sum + comment.votes, 0);
        const avgVotesPerComment = totalComments > 0 ? (totalVotes / totalComments).toFixed(1) : 0;

        const topCommenters = session.participants.sort((a, b) => b.commentsCount - a.commentsCount).slice(0, 3);

        const topVotedComments = comments.sort((a, b) => b.votes - a.votes).slice(0, 5);

        const participationScore = session.participants.reduce((sum, p) => sum + p.score, 0);
        const avgParticipationScore =
            session.participants.length > 0 ? (participationScore / session.participants.length).toFixed(1) : 0;

        return {
            totalComments,
            totalVotes,
            avgVotesPerComment,
            topCommenters,
            topVotedComments,
            participationScore,
            avgParticipationScore,
        };
    };

    const formatTime = timestamp => {
        return new Date(timestamp).toLocaleString();
    };

    const getDuration = () => {
        if (!session) return 'N/A';

        const start = new Date(session.createdAt);
        const end = session.endedAt ? new Date(session.endedAt) : new Date();
        const duration = Math.floor((end - start) / 1000 / 60); // minutes

        return `${duration} minutes`;
    };

    const getRankBadge = index => {
        const badges = ['🥇', '🥈', '🥉'];
        return badges[index] || `#${index + 1}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading session summary...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Session Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        No summary data found for session "{roomCode}".
                    </p>
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

    const stats = calculateStats();
    const finalParticipants = session.participants.sort((a, b) => b.score - a.score);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
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
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Session Summary
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        {session.sessionName || 'Code Review Session'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Room Code: {roomCode} • {formatTime(session.createdAt)}
                    </p>
                </div>

                {/* Session Overview */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{getDuration()}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Participants</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {session.participants.length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-green-600 dark:text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Comments</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalComments}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Votes</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalVotes}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 11l5-5m0 0l5 5m-5-5v12"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Rankings */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Final Rankings</h3>
                            <div className="space-y-4">
                                {finalParticipants.map((participant, index) => (
                                    <div
                                        key={participant.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-lg">{getRankBadge(index)}</span>
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {participant.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {participant.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {participant.commentsCount} comments • {participant.votesReceived}{' '}
                                                    votes
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {participant.score}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">score</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Comments */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Comments</h3>
                            <div className="space-y-4">
                                {stats.topVotedComments.length > 0 ? (
                                    stats.topVotedComments.map((comment, index) => (
                                        <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {comment.author}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTime(comment.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span>{comment.votes}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        No comments were made during this session.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Session Statistics</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.avgVotesPerComment}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Average votes per comment</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {stats.avgParticipationScore}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Average participation score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {session.language}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Programming language</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => router.push('/create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg mr-4 transition duration-200"
                        >
                            Create New Session
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

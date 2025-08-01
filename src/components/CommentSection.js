'use client';

import { useState } from 'react';

const CommentSection = ({ comments, onAddComment, onVoteComment, currentUserId }) => {
    const [newComment, setNewComment] = useState('');
    const [reportedComments, setReportedComments] = useState([]);

    const handleSubmitComment = e => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    const handleReportComment = commentId => {
        if (reportedComments.includes(commentId)) return;

        const isConfirmed = window.confirm('Are you sure you want to report this comment as inappropriate?');
        if (isConfirmed) {
            setReportedComments([...reportedComments, commentId]);
            // In a real app, you would send this to the server
            console.log('Comment reported:', commentId);
        }
    };

    const formatTime = timestamp => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comments ({comments.length})</h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                        <svg
                            className="w-12 h-12 mx-auto mb-4 opacity-50"
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
                        <p>No comments yet. Be the first to review!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {comment.author.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {comment.author}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTime(comment.timestamp)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{comment.text}</p>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => onVoteComment(comment.id)}
                                    disabled={comment.voters.includes(currentUserId)}
                                    className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${
                                        comment.voters.includes(currentUserId)
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-300'
                                    }`}
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>{comment.votes}</span>
                                </button>

                                <div className="flex items-center space-x-2">
                                    {comment.authorId === currentUserId ? (
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            Your comment
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleReportComment(comment.id)}
                                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Report inappropriate comment"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmitComment} className="space-y-3">
                    <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add your feedback or review comment..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                        rows={3}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                        Add Comment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommentSection;

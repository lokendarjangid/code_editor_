'use client';

const ParticipantsList = ({ participants, isHost, hostId, onToggleParticipantEdit }) => {
    // Debug logging
    console.log('ParticipantsList props:', {
        participantsCount: participants.length,
        isHost,
        hostId,
        participantIds: participants.map(p => ({ id: p.id, name: p.name, isHost: p.isHost })),
    });

    // Remove duplicates and ensure unique participants by ID
    const uniqueParticipants = participants.filter(
        (participant, index, self) => index === self.findIndex(p => p.id === participant.id)
    );

    // Calculate proper scores and sort participants
    const processedParticipants = uniqueParticipants.map(participant => ({
        ...participant,
        score: (participant.votesReceived || 0) * 2 + (participant.commentsCount || 0),
        votesReceived: participant.votesReceived || 0,
        commentsCount: participant.commentsCount || 0,
    }));

    const sortedParticipants = [...processedParticipants].sort((a, b) => {
        // Sort by score (desc), then by votes received (desc), then by comments count (desc)
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        if (b.votesReceived !== a.votesReceived) {
            return b.votesReceived - a.votesReceived;
        }
        return b.commentsCount - a.commentsCount;
    });

    const getRankIcon = (index, score) => {
        // Only show medals if there's actual activity
        if (score === 0) return `#${index + 1}`;

        switch (index) {
            case 0:
                return '🥇';
            case 1:
                return '🥈';
            case 2:
                return '🥉';
            default:
                return `#${index + 1}`;
        }
    };

    const getScoreColor = score => {
        if (score >= 10) return 'text-green-600 dark:text-green-400';
        if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="p-3 lg:p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                </svg>
                Leaderboard ({sortedParticipants.length})
            </h3>

            <div className="space-y-2">
                {sortedParticipants.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                        <svg
                            className="w-8 h-8 mx-auto mb-2 opacity-50"
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
                        No participants yet
                    </p>
                ) : (
                    sortedParticipants.map((participant, index) => {
                        const isTopPerformer = index < 3 && participant.score > 0;
                        return (
                            <div
                                key={participant.id}
                                className={`flex items-center justify-between p-2 lg:p-3 rounded-lg transition-all duration-200 ${
                                    isTopPerformer
                                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800'
                                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
                                    <span className="text-sm lg:text-base flex-shrink-0">
                                        {getRankIcon(index, participant.score)}
                                    </span>
                                    <div
                                        className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-medium flex-shrink-0 ${
                                            isTopPerformer
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                        }`}
                                    >
                                        {participant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white truncate">
                                                {participant.name}
                                            </p>
                                            {participant.id === hostId && (
                                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                                                    Host
                                                </span>
                                            )}
                                            {participant.canEdit && participant.id !== hostId && (
                                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                                                    Editor
                                                </span>
                                            )}
                                            {!participant.canEdit && participant.id !== hostId && (
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                                    Viewer
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {participant.commentsCount} comments • {participant.votesReceived} votes
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Edit permission toggle for host */}
                                    {isHost && participant.id !== hostId && onToggleParticipantEdit && (
                                        <button
                                            onClick={() =>
                                                onToggleParticipantEdit(participant.id, !participant.canEdit)
                                            }
                                            className={`text-xs px-2 py-1 rounded transition-colors ${
                                                participant.canEdit
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                            title={
                                                participant.canEdit ? 'Remove edit permission' : 'Grant edit permission'
                                            }
                                        >
                                            {participant.canEdit ? '🔒' : '✏️'}
                                        </button>
                                    )}

                                    <div className="text-right flex-shrink-0">
                                        <p
                                            className={`text-sm lg:text-base font-bold ${getScoreColor(participant.score)} ${
                                                isTopPerformer ? 'text-yellow-600 dark:text-yellow-400' : ''
                                            }`}
                                        >
                                            {participant.score}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">score</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {sortedParticipants.length > 0 && (
                <div className="mt-3 lg:mt-4 p-2 lg:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 Score = (Votes × 2) + Comments. Quality feedback earns more votes!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ParticipantsList;

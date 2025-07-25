'use client';

const ParticipantsList = ({ participants }) => {
    const sortedParticipants = [...participants].sort((a, b) => {
        // Sort by votes received (desc), then by comments count (desc)
        if (b.votesReceived !== a.votesReceived) {
            return b.votesReceived - a.votesReceived;
        }
        return b.commentsCount - a.commentsCount;
    });

    const getRankIcon = (index) => {
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

    const getScoreColor = (score) => {
        if (score >= 10) return 'text-green-600 dark:text-green-400';
        if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Participants ({participants.length})
            </h3>

            <div className="space-y-2">
                {sortedParticipants.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No participants yet
                    </p>
                ) : (
                    sortedParticipants.map((participant, index) => (
                        <div
                            key={participant.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                    {getRankIcon(index)}
                                </span>
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {participant.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {participant.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {participant.commentsCount} comments • {participant.votesReceived} votes
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`text-sm font-semibold ${getScoreColor(participant.score)}`}>
                                    {participant.score}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    score
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {participants.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 Rankings are based on votes received and participation. Quality feedback gets more votes!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ParticipantsList;

'use client';

import { useState, useEffect } from 'react';

const SessionTimer = ({ duration }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        let interval = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Could trigger session end here
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        const percentage = (timeLeft / (duration * 60)) * 100;
        if (percentage > 50) return 'text-green-600 dark:text-green-400';
        if (percentage > 25) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
                <svg
                    className="w-4 h-4 text-gray-600 dark:text-gray-300"
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
                <span className={`font-mono text-sm font-medium ${getTimerColor()}`}>{formatTime(timeLeft)}</span>
            </div>

            <button
                onClick={toggleTimer}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                title={isActive ? 'Pause timer' : 'Resume timer'}
            >
                {isActive ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </button>

            {timeLeft === 0 && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg px-2 py-1">
                    <span className="text-xs text-red-800 dark:text-red-300 font-medium">Time's up!</span>
                </div>
            )}
        </div>
    );
};

export default SessionTimer;

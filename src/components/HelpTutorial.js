'use client';

import { useState, useEffect } from 'react';

const HelpTutorial = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const tutorialSteps = [
        {
            title: 'Welcome to Peer Rank! 🎉',
            content:
                'This is a real-time collaborative code review platform where you can review code, give feedback, and earn points based on the quality of your contributions.',
            icon: '🚀',
        },
        {
            title: 'Code Editor',
            content:
                'The left panel contains the code editor where you can view and edit the code being reviewed. Changes are synchronized in real-time with all participants.',
            icon: '💻',
        },
        {
            title: 'Comments & Feedback',
            content:
                'Use the comment section to provide constructive feedback about the code. Be specific and helpful in your reviews.',
            icon: '💬',
        },
        {
            title: 'Voting System',
            content:
                'Vote on comments that you find helpful or insightful. Quality feedback gets more votes and earns higher scores.',
            icon: '👍',
        },
        {
            title: 'Rankings & Scoring',
            content:
                'Your score is based on the votes your comments receive and your participation level. Higher quality feedback leads to better rankings.',
            icon: '🏆',
        },
        {
            title: 'Best Practices',
            content:
                '• Be constructive and specific in your feedback\n• Focus on code quality, performance, and readability\n• Upvote helpful comments from others\n• Stay engaged throughout the session',
            icon: '✨',
        },
    ];

    const nextStep = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('peer-rank-tutorial-shown', 'true');
        onClose();
    };

    const skipTutorial = () => {
        handleClose();
    };

    if (!isVisible) return null;

    const step = tutorialSteps[currentStep];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
                    <div className="text-4xl mb-2">{step.icon}</div>
                    <h2 className="text-xl font-bold">{step.title}</h2>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed whitespace-pre-line">
                        {step.content}
                    </div>

                    {/* Progress indicators */}
                    <div className="flex justify-center mb-6">
                        {tutorialSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full mx-1 ${
                                    index === currentStep
                                        ? 'bg-blue-600'
                                        : index < currentStep
                                          ? 'bg-blue-400'
                                          : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={skipTutorial}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
                        >
                            Skip Tutorial
                        </button>

                        <div className="flex space-x-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                >
                                    Previous
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpTutorial;

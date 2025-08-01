'use client';

import { useState, useEffect } from 'react';
import { PlayIcon, StopIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const CodeExecutionPanel = ({
    code,
    language,
    onExecute,
    isExecuting,
    executionResult,
    onClearOutput,
    socketRef,
    roomCode,
}) => {
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [executionTime, setExecutionTime] = useState(null);
    const [executionHistory, setExecutionHistory] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const getSupportedLanguages = () => {
        return ['javascript', 'python', 'java', 'cpp', 'c'];
    };

    const isLanguageSupported = getSupportedLanguages().includes(language?.toLowerCase());

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on('code-execution-result', data => {
                setOutput(data.result.output || '');
                setError(data.result.error || '');
                setExecutionTime(data.result.executionTime);

                // Add to history
                const historyEntry = {
                    id: Date.now(),
                    timestamp: data.timestamp,
                    executedBy: data.executedBy,
                    language: language,
                    success: data.result.success,
                    output: data.result.output,
                    error: data.result.error,
                    executionTime: data.result.executionTime,
                };

                setExecutionHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 executions
            });

            socketRef.current.on('code-execution-error', data => {
                setError(data.error);
                setOutput('');
                setExecutionTime(null);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('code-execution-result');
                socketRef.current.off('code-execution-error');
            }
        };
    }, [socketRef, language]);

    useEffect(() => {
        if (executionResult) {
            setOutput(executionResult.output || '');
            setError(executionResult.error || '');
            setExecutionTime(executionResult.executionTime);
        }
    }, [executionResult]);

    const handleExecute = () => {
        if (isExecuting) return;

        setOutput('');
        setError('');
        setExecutionTime(null);

        if (socketRef.current && roomCode) {
            socketRef.current.emit('execute-code', {
                roomCode,
                code,
                language,
            });
        } else if (onExecute) {
            onExecute();
        } else {
            // Fallback - make direct API call
            executeCodeDirectly();
        }
    };

    const executeCodeDirectly = async () => {
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language }),
            });

            const result = await response.json();

            if (result.success) {
                setOutput(result.output || '');
                setError('');
                setExecutionTime(result.executionTime);
            } else {
                setError(result.error || 'Execution failed');
                setOutput('');
                setExecutionTime(null);
            }
        } catch (error) {
            setError(`Network error: ${error.message}`);
            setOutput('');
            setExecutionTime(null);
        }
    };

    const handleClear = () => {
        setOutput('');
        setError('');
        setExecutionTime(null);
        if (onClearOutput) {
            onClearOutput();
        }
    };

    const clearOutput = handleClear;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                    <PlayIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Code Execution
                </h3>
                <div className="flex space-x-1">
                    <button
                        onClick={handleExecute}
                        disabled={isExecuting || !code.trim() || !isLanguageSupported}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                            isExecuting || !code.trim() || !isLanguageSupported
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                        }`}
                    >
                        {isExecuting ? (
                            <>
                                <div className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Running...
                            </>
                        ) : (
                            <>
                                <PlayIcon className="w-3 h-3 mr-1" />
                                Run
                            </>
                        )}
                    </button>

                    <button
                        onClick={clearOutput}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Language Support Warning */}
            {!isLanguageSupported && (
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            <strong>{language}</strong> not supported. Use: {getSupportedLanguages().join(', ')}
                        </p>
                    </div>
                </div>
            )}

            {/* Language Info */}
            <div className="flex items-center justify-between">
                <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                        isLanguageSupported
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                >
                    {language}
                </span>
                {executionTime && (
                    <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {executionTime}ms
                    </span>
                )}
            </div>

            {/* Output/Error Display */}
            <div className="space-y-2">
                {output && (
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <div className="flex items-center mb-1">
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">Output:</span>
                        </div>
                        <pre className="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto">
                            {output}
                        </pre>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                        <div className="flex items-center mb-1">
                            <ExclamationTriangleIcon className="w-3 h-3 text-red-500 mr-1" />
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">Error:</span>
                        </div>
                        <pre className="text-xs text-red-800 dark:text-red-200 whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto">
                            {error}
                        </pre>
                    </div>
                )}

                {!output && !error && !isExecuting && (
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Click "Run" to execute the code</p>
                    </div>
                )}
            </div>

            {/* Execution History */}
            {executionHistory.length > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center justify-between w-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    >
                        <span>History ({executionHistory.length})</span>
                        <svg
                            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isExpanded && (
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {executionHistory.map(entry => (
                                <div key={entry.id} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            <span
                                                className={`px-1 py-0.5 rounded text-xs ${
                                                    entry.success
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                                        : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {entry.success ? '✓' : '✗'}
                                            </span>
                                            {entry.executionTime && (
                                                <span className="text-gray-500">{entry.executionTime}ms</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-gray-700 dark:text-gray-300 truncate">
                                        By: {entry.executedBy}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodeExecutionPanel;

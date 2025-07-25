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
    roomCode
}) => {
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [executionTime, setExecutionTime] = useState(null);
    const [executionHistory, setExecutionHistory] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on('code-execution-result', (data) => {
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
                    executionTime: data.result.executionTime
                };

                setExecutionHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 executions
            });

            socketRef.current.on('code-execution-error', (data) => {
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
                language
            });
        } else if (onExecute) {
            onExecute();
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

    const getSupportedLanguages = () => {
        return ['javascript', 'python', 'java', 'cpp', 'c'];
    };

    const isLanguageSupported = getSupportedLanguages().includes(language?.toLowerCase());

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <PlayIcon className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-gray-800">Code Execution</h3>
                    </div>
                    {language && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${isLanguageSupported
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {language.toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Language Support Warning */}
                {!isLanguageSupported && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                            <p className="text-sm text-yellow-800">
                                Code execution is not supported for <strong>{language}</strong>.
                                Supported languages: {getSupportedLanguages().join(', ')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Execution Controls */}
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={handleExecute}
                        disabled={isExecuting || !isLanguageSupported}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isExecuting || !isLanguageSupported
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {isExecuting ? (
                            <>
                                <StopIcon className="h-4 w-4 animate-spin" />
                                Executing...
                            </>
                        ) : (
                            <>
                                <PlayIcon className="h-4 w-4" />
                                Run Code
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleClear}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Clear Output
                    </button>
                </div>

                {/* Output Section */}
                {(output || error || executionTime !== null) && (
                    <div className="space-y-3">
                        {/* Execution Time */}
                        {executionTime !== null && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ClockIcon className="h-4 w-4" />
                                Execution time: {executionTime}ms
                            </div>
                        )}

                        {/* Output */}
                        {output && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Output:</h4>
                                <pre className="bg-gray-50 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-64 overflow-auto">
                                    {output}
                                </pre>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div>
                                <h4 className="text-sm font-medium text-red-700 mb-2">Error:</h4>
                                <pre className="bg-red-50 p-3 rounded-lg text-sm font-mono text-red-800 whitespace-pre-wrap max-h-64 overflow-auto">
                                    {error}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Execution History */}
                {isExpanded && executionHistory.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Execution History</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {executionHistory.map((entry) => (
                                <div key={entry.id} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-gray-600">
                                            {new Date(entry.timestamp).toLocaleTimeString()} - {entry.executedBy}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded ${entry.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {entry.success ? 'Success' : 'Error'}
                                        </span>
                                    </div>
                                    {entry.output && (
                                        <pre className="text-gray-800 whitespace-pre-wrap">
                                            {entry.output.length > 100
                                                ? entry.output.substring(0, 100) + '...'
                                                : entry.output
                                            }
                                        </pre>
                                    )}
                                    {entry.error && (
                                        <pre className="text-red-600 whitespace-pre-wrap">
                                            {entry.error.length > 100
                                                ? entry.error.substring(0, 100) + '...'
                                                : entry.error
                                            }
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeExecutionPanel;

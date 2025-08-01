'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSession() {
    const [sessionConfig, setSessionConfig] = useState({
        language: 'javascript',
        duration: 30,
        maxParticipants: 10,
        sessionName: '',
    });
    const [isCreating, setIsCreating] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [isCheckingActive, setIsCheckingActive] = useState(true);
    const router = useRouter();

    // Check for active sessions on component mount
    useEffect(() => {
        checkActiveSession();
    }, []);

    const checkActiveSession = async () => {
        try {
            setIsCheckingActive(true);
            const response = await fetch('/api/session/active');
            const data = await response.json();

            if (data.success && data.hasActiveSession && data.activeSessions.length > 0) {
                setActiveSession(data.activeSessions[0]);
            } else {
                setActiveSession(null);
            }
        } catch (error) {
            console.error('Error checking active sessions:', error);
            setActiveSession(null);
        } finally {
            setIsCheckingActive(false);
        }
    };

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const getSampleCode = language => {
        const samples = {
            javascript: `// Welcome to Peer Rank Code Review!
// Start reviewing and commenting on the code below

function greetUser(name) {
    if (!name) {
        return "Hello, Guest!";
    }
    return \`Hello, \${name}!\`;
}

console.log(greetUser("World"));`,
            python: `# Welcome to Peer Rank Code Review!
# Start reviewing and commenting on the code below

def greet_user(name):
    if not name:
        return "Hello, Guest!"
    return f"Hello, {name}!"

print(greet_user("World"))`,
            java: `// Welcome to Peer Rank Code Review!
// Start reviewing and commenting on the code below

public class Main {
    public static void main(String[] args) {
        System.out.println(greetUser("World"));
    }
    
    public static String greetUser(String name) {
        if (name == null || name.isEmpty()) {
            return "Hello, Guest!";
        }
        return "Hello, " + name + "!";
    }
}`,
            cpp: `// Welcome to Peer Rank Code Review!
// Start reviewing and commenting on the code below

#include <iostream>
#include <string>

std::string greetUser(const std::string& name) {
    if (name.empty()) {
        return "Hello, Guest!";
    }
    return "Hello, " + name + "!";
}

int main() {
    std::cout << greetUser("World") << std::endl;
    return 0;
}`,
            c: `// Welcome to Peer Rank Code Review!
// Start reviewing and commenting on the code below

#include <stdio.h>
#include <string.h>

void greetUser(char* name) {
    if (strlen(name) == 0) {
        printf("Hello, Guest!\\n");
    } else {
        printf("Hello, %s!\\n", name);
    }
}

int main() {
    greetUser("World");
    return 0;
}`,
            html: `<!-- Welcome to Peer Rank Code Review! -->
<!-- Start reviewing and commenting on the code below -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to the code review session.</p>
</body>
</html>`,
            css: `/* Welcome to Peer Rank Code Review! */
/* Start reviewing and commenting on the code below */

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f4f4f4;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
    color: #333;
    text-align: center;
}`,
            sql: `-- Welcome to Peer Rank Code Review!
-- Start reviewing and commenting on the code below

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');

SELECT * FROM users WHERE name LIKE 'J%';`,
            json: `{
  "message": "Welcome to Peer Rank Code Review!",
  "description": "Start reviewing and commenting on the code below",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "active": true
    },
    {
      "id": 2,
      "name": "Jane Smith", 
      "email": "jane@example.com",
      "active": false
    }
  ],
  "metadata": {
    "version": "1.0",
    "created": "2024-01-01"
  }
}`,
        };
        return samples[language] || samples.javascript;
    };

    const handleCreateSession = async e => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // Check for active sessions before creating
            await checkActiveSession();

            if (activeSession) {
                alert(
                    `Only one session can be active at a time. There's already an active session: ${activeSession.sessionName} (${activeSession.roomCode})`
                );
                setIsCreating(false);
                return;
            }

            const roomCode = generateRoomCode();

            // Prepare session data with sample code based on language
            const sessionData = {
                ...sessionConfig,
                roomCode,
                createdAt: new Date().toISOString(),
                participants: {},
                comments: [],
                code: getSampleCode(sessionConfig.language),
                status: 'waiting',
                hostId: null, // Will be set when host joins
                editMode: 'host-only', // 'host-only' or 'collaborative'
            };

            // Store session on the server
            const res = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomCode, sessionData }),
            });
            const data = await res.json();

            if (!data.success) {
                if (data.activeSession) {
                    // Show active session info
                    alert(
                        `Only one session can be active at a time. Active session: ${data.activeSession.sessionName} (${data.activeSession.roomCode}) with ${data.activeSession.participantCount} participants.`
                    );
                } else {
                    throw new Error(data.error || 'Failed to create session');
                }
                setIsCreating(false);
                return;
            }

            // Redirect to the session room
            router.push(`/session/${roomCode}`);
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Failed to create session. Please try again.');
            setIsCreating(false);
        }
    };

    // Show loading state while checking for active sessions
    if (isCheckingActive) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Checking for active sessions...</p>
                </div>
            </div>
        );
    }

    // Show active session warning if one exists
    if (activeSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
                <div className="container mx-auto px-4 py-6 lg:py-8">
                    <div className="text-center mb-6">
                        <button
                            onClick={() => router.push('/')}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-3 lg:mb-4 transition-colors"
                        >
                            <svg
                                className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to Home
                        </button>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 lg:p-8 text-center">
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">
                                Session Already Active
                            </h2>

                            <p className="text-yellow-700 dark:text-yellow-300 mb-6">
                                Only one session can be active at a time. There's currently an active session running.
                            </p>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Active Session:</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    <strong>{activeSession.sessionName}</strong>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Room Code: <span className="font-mono">{activeSession.roomCode}</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Participants: {activeSession.participantCount}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => router.push(`/session/${activeSession.roomCode}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Join Active Session
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Back to Home
                                </button>
                                <button
                                    onClick={checkActiveSession}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-1/3 right-20 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative container mx-auto px-4 py-6 lg:py-8">
                {/* Header */}
                <div className="text-center mb-6 lg:mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-3 lg:mb-4 transition-colors"
                    >
                        <svg
                            className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </button>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 lg:mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Create New Session
                    </h1>
                    <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300">
                        Configure your code review session settings
                    </p>
                </div>

                {/* Create Session Form */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl lg:rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50">
                        <form onSubmit={handleCreateSession} className="space-y-4 lg:space-y-6">
                            {/* Session Name */}
                            <div>
                                <label
                                    htmlFor="sessionName"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Session Name
                                </label>
                                <input
                                    type="text"
                                    id="sessionName"
                                    value={sessionConfig.sessionName}
                                    onChange={e => setSessionConfig({ ...sessionConfig, sessionName: e.target.value })}
                                    placeholder="Enter session name..."
                                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white transition-all duration-200"
                                    required
                                />
                            </div>

                            {/* Programming Language */}
                            <div>
                                <label
                                    htmlFor="language"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Programming Language
                                </label>
                                <select
                                    id="language"
                                    value={sessionConfig.language}
                                    onChange={e => setSessionConfig({ ...sessionConfig, language: e.target.value })}
                                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white transition-all duration-200"
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

                            {/* Session Duration and Max Participants - Mobile Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="duration"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Duration (minutes)
                                    </label>
                                    <select
                                        id="duration"
                                        value={sessionConfig.duration}
                                        onChange={e =>
                                            setSessionConfig({ ...sessionConfig, duration: parseInt(e.target.value) })
                                        }
                                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white transition-all duration-200"
                                    >
                                        <option value={15}>15 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={45}>45 minutes</option>
                                        <option value={60}>1 hour</option>
                                        <option value={90}>1.5 hours</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="maxParticipants"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Max Participants
                                    </label>
                                    <select
                                        id="maxParticipants"
                                        value={sessionConfig.maxParticipants}
                                        onChange={e =>
                                            setSessionConfig({
                                                ...sessionConfig,
                                                maxParticipants: parseInt(e.target.value),
                                            })
                                        }
                                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white transition-all duration-200"
                                    >
                                        <option value={5}>5 participants</option>
                                        <option value={10}>10 participants</option>
                                        <option value={15}>15 participants</option>
                                        <option value={20}>20 participants</option>
                                    </select>
                                </div>
                            </div>

                            {/* Create Button */}
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 lg:py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                            >
                                {isCreating ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2"></div>
                                        Creating Session...
                                    </div>
                                ) : (
                                    'Create Session'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Card */}
                    <div className="mt-6 lg:mt-8 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4 lg:p-6 backdrop-blur-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Session Setup Complete
                                </h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                    <p>
                                        After creating the session, you'll receive a unique room code to share with
                                        participants. The session will include sample code based on your selected
                                        programming language.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

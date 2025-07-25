'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import CodeEditor from '../../../components/CodeEditor';
import CommentSection from '../../../components/CommentSection';
import ParticipantsList from '../../../components/ParticipantsList';
import SessionTimer from '../../../components/SessionTimer';
import HelpTutorial from '../../../components/HelpTutorial';
import CodeExecutionPanel from '../../../components/CodeExecutionPanel';

export default function SessionRoom() {
    const params = useParams();
    const router = useRouter();
    const { roomCode } = params;
    const socketRef = useRef(null);

    const [session, setSession] = useState(null);
    const [participant, setParticipant] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [code, setCode] = useState('// Welcome to Peer Rank Code Review!\n// Start reviewing and commenting on the code below\n\nfunction exampleFunction() {\n    console.log("Hello, World!");\n    return true;\n}');
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [showMobilePanel, setShowMobilePanel] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // Check if user has seen tutorial
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('peer-rank-tutorial-shown');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    // Initialize socket connection
    useEffect(() => {
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to server');
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from server');
        });

        socketRef.current.on('session-state', (data) => {
            setParticipants(data.participants);
            setComments(data.comments);
            if (data.code) {
                setCode(data.code);
            }
        });

        socketRef.current.on('participant-joined', (data) => {
            setParticipants(data.participants);
        });

        socketRef.current.on('participant-left', (data) => {
            setParticipants(data.participants);
        });

        socketRef.current.on('code-updated', (data) => {
            setCode(data.code);
        });

        socketRef.current.on('comment-added', (data) => {
            setComments(prev => [...prev, data.comment]);
        });

        socketRef.current.on('comment-voted', (data) => {
            setComments(prev => prev.map(comment =>
                comment.id === data.commentId
                    ? { ...comment, votes: data.votes }
                    : comment
            ));
            setParticipants(data.participants);
        });

        socketRef.current.on('user-typing', (data) => {
            setTypingUsers(prev => {
                const filtered = prev.filter(user => user.userId !== data.userId);
                if (data.isTyping) {
                    return [...filtered, data];
                }
                return filtered;
            });
        });

        socketRef.current.on('session-ended', () => {
            // Save session data for summary
            const sessionData = {
                ...session,
                participants,
                endedAt: new Date().toISOString()
            };
            localStorage.setItem(`session_${roomCode}`, JSON.stringify(sessionData));
            localStorage.setItem(`comments_${roomCode}`, JSON.stringify(comments));

            // Redirect to summary
            router.push(`/summary/${roomCode}`);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomCode, router]);

    useEffect(() => {
        // Load session data
        const sessionData = localStorage.getItem(`session_${roomCode}`);
        if (sessionData) {
            const parsedSession = JSON.parse(sessionData);
            setSession(parsedSession);

            // Load sample code based on language
            const sampleCode = getSampleCode(parsedSession.language);
            setCode(sampleCode);
        } else {
            // Session not found
            router.push('/');
        }
        setIsLoading(false);
    }, [roomCode, router]);

    const getSampleCode = (language) => {
        const samples = {
            javascript: `// JavaScript Code Review Session
function calculateFactorial(n) {
    if (n < 0) return undefined;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Usage example
console.log(calculateFactorial(5)); // Should output 120`,

            python: `# Python Code Review Session
def fibonacci_sequence(n):
    """Generate fibonacci sequence up to n terms"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        next_num = sequence[i-1] + sequence[i-2]
        sequence.append(next_num)
    
    return sequence

# Usage example
print(fibonacci_sequence(10))`,

            java: `// Java Code Review Session
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // Element not found
    }
}`,

            cpp: `// C++ Code Review Session
#include <iostream>
#include <vector>
#include <algorithm>

class QuickSort {
public:
    static void quickSort(std::vector<int>& arr, int low, int high) {
        if (low < high) {
            int pivot = partition(arr, low, high);
            quickSort(arr, low, pivot - 1);
            quickSort(arr, pivot + 1, high);
        }
    }
    
private:
    static int partition(std::vector<int>& arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                std::swap(arr[i], arr[j]);
            }
        }
        std::swap(arr[i + 1], arr[high]);
        return i + 1;
    }
};

// Usage example
int main() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    QuickSort::quickSort(arr, 0, arr.size() - 1);
    
    for (int num : arr) {
        std::cout << num << " ";
    }
    return 0;
}`,

            html: `<!-- HTML Code Review Session -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Todo List</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .todo-item { padding: 10px; border: 1px solid #ddd; margin: 5px 0; }
        .completed { text-decoration: line-through; opacity: 0.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>My Todo List</h1>
        <form id="todo-form">
            <input type="text" id="todo-input" placeholder="Add a new task..." required>
            <button type="submit">Add Task</button>
        </form>
        <div id="todo-list"></div>
    </div>
    
    <script>
        // JavaScript for todo functionality
        const form = document.getElementById('todo-form');
        const input = document.getElementById('todo-input');
        const todoList = document.getElementById('todo-list');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addTodo(input.value);
            input.value = '';
        });
        
        function addTodo(text) {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';
            todoItem.innerHTML = \`
                <span>\${text}</span>
                <button onclick="toggleComplete(this)">Complete</button>
                <button onclick="deleteTodo(this)">Delete</button>
            \`;
            todoList.appendChild(todoItem);
        }
        
        function toggleComplete(button) {
            button.parentElement.classList.toggle('completed');
        }
        
        function deleteTodo(button) {
            button.parentElement.remove();
        }
    </script>
</body>
</html>`,

            css: `/* CSS Code Review Session */
/* Modern Card Component Styling */

.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 24px;
    width: 300px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.card-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.card-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    color: white;
    font-size: 18px;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.card-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
}

.card-actions {
    display: flex;
    gap: 10px;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5a67d8;
}

.btn-secondary {
    background: #e2e8f0;
    color: #4a5568;
}

.btn-secondary:hover {
    background: #cbd5e0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .card-container {
        padding: 10px;
    }
    
    .card {
        width: 100%;
        max-width: 400px;
    }
}`,

            sql: `-- SQL Code Review Session
-- E-commerce Database Schema and Queries

-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Complex query: Get top 5 customers by total spending
SELECT 
    u.username,
    u.email,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as avg_order_value
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
    AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY u.id, u.username, u.email
HAVING total_spent > 100
ORDER BY total_spent DESC
LIMIT 5;

-- Query: Products with low stock
SELECT 
    p.name,
    p.stock_quantity,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock_quantity < 10
ORDER BY p.stock_quantity ASC;`,

            json: `{
  "api": {
    "version": "2.0",
    "title": "E-commerce API",
    "description": "RESTful API for managing an e-commerce platform",
    "baseUrl": "https://api.example.com/v2",
    "authentication": {
      "type": "Bearer Token",
      "header": "Authorization"
    }
  },
  "endpoints": {
    "users": {
      "get": {
        "path": "/users",
        "method": "GET",
        "description": "Retrieve all users",
        "parameters": {
          "page": {
            "type": "integer",
            "default": 1,
            "description": "Page number for pagination"
          },
          "limit": {
            "type": "integer",
            "default": 10,
            "max": 100,
            "description": "Number of users per page"
          },
          "search": {
            "type": "string",
            "description": "Search users by name or email"
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "type": "object",
              "properties": {
                "users": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer" },
                      "username": { "type": "string" },
                      "email": { "type": "string" },
                      "created_at": { "type": "string", "format": "date-time" }
                    }
                  }
                },
                "pagination": {
                  "type": "object",
                  "properties": {
                    "current_page": { "type": "integer" },
                    "total_pages": { "type": "integer" },
                    "total_items": { "type": "integer" }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "schema": {
              "type": "object",
              "properties": {
                "error": { "type": "string" },
                "message": { "type": "string" }
              }
            }
          }
        }
      },
      "post": {
        "path": "/users",
        "method": "POST",
        "description": "Create a new user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["username", "email", "password"],
                "properties": {
                  "username": {
                    "type": "string",
                    "minLength": 3,
                    "maxLength": 50
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "password": {
                    "type": "string",
                    "minLength": 8
                  }
                }
              }
            }
          }
        }
      }
    },
    "products": {
      "get": {
        "path": "/products",
        "method": "GET",
        "description": "Retrieve products with filtering and sorting",
        "parameters": {
          "category": {
            "type": "string",
            "description": "Filter by category"
          },
          "price_min": {
            "type": "number",
            "description": "Minimum price filter"
          },
          "price_max": {
            "type": "number",
            "description": "Maximum price filter"
          },
          "sort": {
            "type": "string",
            "enum": ["name", "price", "created_at"],
            "default": "created_at"
          },
          "order": {
            "type": "string",
            "enum": ["asc", "desc"],
            "default": "desc"
          }
        }
      }
    }
  },
  "models": {
    "User": {
      "type": "object",
      "properties": {
        "id": { "type": "integer" },
        "username": { "type": "string" },
        "email": { "type": "string" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      }
    },
    "Product": {
      "type": "object",
      "properties": {
        "id": { "type": "integer" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "price": { "type": "number" },
        "stock_quantity": { "type": "integer" },
        "category_id": { "type": "integer" }
      }
    }
  }
}`
        };

        return samples[language] || samples.javascript;
    };

    const handleJoinSession = (name) => {
        if (name.trim()) {
            setIsJoining(true);
            const newParticipant = {
                id: Date.now().toString(),
                name: name.trim(),
                joinedAt: new Date().toISOString(),
                score: 0,
                commentsCount: 0,
                votesReceived: 0
            };

            setParticipant(newParticipant);
            setUserName(name.trim());

            // Join session via socket
            if (socketRef.current) {
                socketRef.current.emit('join-session', {
                    roomCode,
                    participant: newParticipant
                });
            }

            setIsJoining(false);
        }
    };

    const handleAddComment = (comment) => {
        if (participant && socketRef.current) {
            const newComment = {
                id: Date.now().toString(),
                text: comment,
                author: participant.name,
                authorId: participant.id,
                line: null,
                timestamp: new Date().toISOString(),
                votes: 0,
                voters: []
            };

            // Emit via socket for real-time sync
            socketRef.current.emit('new-comment', {
                roomCode,
                comment: newComment
            });

            // Update local participant stats
            const updatedParticipant = {
                ...participant,
                commentsCount: participant.commentsCount + 1
            };
            setParticipant(updatedParticipant);
        }
    };

    const handleVoteComment = (commentId) => {
        if (!participant || !socketRef.current) return;

        const comment = comments.find(c => c.id === commentId);
        if (comment && !comment.voters.includes(participant.id)) {
            socketRef.current.emit('vote-comment', {
                roomCode,
                commentId,
                voterId: participant.id
            });
        }
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (socketRef.current) {
            socketRef.current.emit('code-change', {
                roomCode,
                code: newCode
            });
        }
    };

    const handleEndSession = () => {
        if (socketRef.current) {
            socketRef.current.emit('end-session', { roomCode });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading session...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Session Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">The session with code "{roomCode}" does not exist.</p>
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

    if (!participant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Join Session</h1>
                        <p className="text-gray-600 dark:text-gray-300">Room Code: <span className="font-mono font-bold">{roomCode}</span></p>
                        {session && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{session.sessionName}</p>}
                        <div className="flex items-center justify-center mt-2">
                            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {isConnected ? 'Connected' : 'Connecting...'}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleJoinSession(userName);
                    }} className="space-y-4">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="userName"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your name..."
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isJoining || !isConnected}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isJoining ? 'Joining...' : 'Join Session'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {session?.sessionName || 'Code Review Session'}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Room: {roomCode} • {session?.language || 'javascript'}
                                <span className={`ml-2 inline-flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                                    <span className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {isConnected ? 'Live' : 'Offline'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <SessionTimer duration={session?.duration || 30} />
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-lg transition duration-200"
                            title="Show tutorial"
                        >
                            ?
                        </button>
                        <button
                            onClick={handleEndSession}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-lg transition duration-200"
                        >
                            End Session
                        </button>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Welcome, <span className="font-semibold">{participant.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
                {/* Left Panel - Code Editor */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Review</h2>
                            {typingUsers.length > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                                    {typingUsers.map(user => user.participantName).join(', ')} typing...
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <CodeEditor
                            code={code}
                            language={session?.language || 'javascript'}
                            onChange={handleCodeChange}
                            readOnly={false}
                        />
                    </div>
                </div>

                {/* Right Panel - Code Execution, Comments and Participants */}
                <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col max-h-96 lg:max-h-full">
                    {/* Mobile Toggle Button */}
                    <div className="lg:hidden border-b border-gray-200 dark:border-gray-700 p-2">
                        <button
                            onClick={() => setShowMobilePanel(!showMobilePanel)}
                            className="w-full text-center text-sm font-medium text-gray-700 dark:text-gray-300 py-2"
                        >
                            {showMobilePanel ? 'Hide' : 'Show'} Panel
                        </button>
                    </div>

                    <div className={`flex-1 flex flex-col ${showMobilePanel ? 'block' : 'hidden lg:flex'}`}>
                        {/* Code Execution Panel */}
                        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                            <CodeExecutionPanel
                                code={code}
                                language={session?.language || 'javascript'}
                                socketRef={socketRef}
                                roomCode={roomCode}
                            />
                        </div>

                        {/* Participants */}
                        <div className="border-b border-gray-200 dark:border-gray-700 max-h-48 lg:max-h-none overflow-y-auto">
                            <ParticipantsList participants={participants} />
                        </div>

                        {/* Comments */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <CommentSection
                                comments={comments}
                                onAddComment={handleAddComment}
                                onVoteComment={handleVoteComment}
                                currentUserId={participant.id}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Tutorial */}
            {showTutorial && (
                <HelpTutorial onClose={() => setShowTutorial(false)} />
            )}
        </div>
    );
}

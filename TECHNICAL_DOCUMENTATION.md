# Technical Documentation - Peer Rank Code Review Platform

## API Documentation

### REST API Endpoints

#### 1. Session Management

**POST /api/session**
- **Purpose:** Create a new session
- **Request Body:**
  ```json
  {
    "roomCode": "ABCD12",
    "sessionData": {
      "sessionName": "JavaScript Review Session",
      "language": "javascript",
      "duration": 30,
      "maxParticipants": 10,
      "code": "// Sample code here",
      "participants": {},
      "comments": [],
      "createdAt": "2025-08-18T10:00:00.000Z",
      "hostId": null,
      "editMode": "host-only"
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "error": "Only one session can be active at a time",
    "activeSession": {
      "roomCode": "EXISTING",
      "sessionName": "Active Session",
      "participantCount": 5
    }
  }
  ```

**GET /api/session?roomCode=ABCD12**
- **Purpose:** Retrieve session data
- **Response:**
  ```json
  {
    "success": true,
    "session": {
      "roomCode": "ABCD12",
      "sessionName": "JavaScript Review Session",
      "language": "javascript",
      "participants": [...],
      "comments": [...],
      "code": "// Session code"
    }
  }
  ```

#### 2. Active Session Check

**GET /api/session/active**
- **Purpose:** Check for active sessions
- **Response:**
  ```json
  {
    "success": true,
    "hasActiveSession": true,
    "activeSessions": [
      {
        "roomCode": "ABCD12",
        "sessionName": "Active Session",
        "participantCount": 3,
        "createdAt": "2025-08-18T10:00:00.000Z"
      }
    ]
  }
  ```

#### 3. Health Check

**GET /api/health**
- **Purpose:** Application health monitoring
- **Response:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-08-18T10:00:00.000Z",
    "uptime": 3600,
    "memory": {
      "rss": 52428800,
      "heapTotal": 29360128,
      "heapUsed": 15728640,
      "external": 1024
    },
    "version": "1.0.0"
  }
  ```

#### 4. Code Execution

**POST /api/execute**
- **Purpose:** Execute code snippets
- **Request Body:**
  ```json
  {
    "code": "console.log('Hello World');",
    "language": "javascript"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "output": "Hello World",
    "error": "",
    "executionTime": 150
  }
  ```

### WebSocket Events Documentation

#### Client → Server Events

**join-session**
```javascript
socket.emit('join-session', {
  roomCode: 'ABCD12',
  participant: {
    id: 'user_123_abc',
    name: 'John Doe',
    joinedAt: '2025-08-18T10:00:00.000Z',
    score: 0,
    commentsCount: 0,
    votesReceived: 0
  }
});
```

**code-change**
```javascript
socket.emit('code-change', {
  roomCode: 'ABCD12',
  code: 'function hello() { console.log("Hello"); }'
});
```

**new-comment**
```javascript
socket.emit('new-comment', {
  roomCode: 'ABCD12',
  comment: {
    id: '1692351600000',
    text: 'This function could be improved',
    author: 'John Doe',
    authorId: 'user_123_abc',
    timestamp: '2025-08-18T10:00:00.000Z',
    votes: 0,
    voters: []
  }
});
```

**vote-comment**
```javascript
socket.emit('vote-comment', {
  roomCode: 'ABCD12',
  commentId: '1692351600000',
  voterId: 'user_456_def'
});
```

**toggle-edit-mode**
```javascript
socket.emit('toggle-edit-mode', {
  roomCode: 'ABCD12',
  editMode: 'collaborative' // or 'host-only'
});
```

**toggle-participant-edit**
```javascript
socket.emit('toggle-participant-edit', {
  roomCode: 'ABCD12',
  participantId: 'user_456_def',
  canEdit: true
});
```

**execute-code**
```javascript
socket.emit('execute-code', {
  roomCode: 'ABCD12',
  code: 'console.log("Hello World");',
  language: 'javascript'
});
```

**typing**
```javascript
socket.emit('typing', {
  roomCode: 'ABCD12',
  isTyping: true
});
```

**end-session**
```javascript
socket.emit('end-session', {
  roomCode: 'ABCD12'
});
```

#### Server → Client Events

**session-state**
```javascript
socket.on('session-state', (data) => {
  // data contains:
  {
    participants: [...],
    comments: [...],
    code: 'current code',
    editMode: 'host-only',
    hostId: 'user_123_abc',
    isHost: true,
    canEdit: true
  }
});
```

**participant-joined**
```javascript
socket.on('participant-joined', (data) => {
  // data contains:
  {
    participant: { /* new participant data */ },
    participants: [...], // all participants
    hostId: 'user_123_abc'
  }
});
```

**participant-left**
```javascript
socket.on('participant-left', (data) => {
  // data contains:
  {
    participantId: 'socket_id',
    participants: [...] // remaining participants
  }
});
```

**code-updated**
```javascript
socket.on('code-updated', (data) => {
  // data contains:
  {
    code: 'updated code content'
  }
});
```

**comment-added**
```javascript
socket.on('comment-added', (data) => {
  // data contains:
  {
    comment: { /* comment object */ }
  }
});
```

**comment-voted**
```javascript
socket.on('comment-voted', (data) => {
  // data contains:
  {
    commentId: '1692351600000',
    votes: 5,
    participants: [...] // updated participant scores
  }
});
```

**edit-mode-changed**
```javascript
socket.on('edit-mode-changed', (data) => {
  // data contains:
  {
    editMode: 'collaborative',
    hostId: 'user_123_abc',
    participants: [...] // with updated permissions
  }
});
```

**participant-edit-changed**
```javascript
socket.on('participant-edit-changed', (data) => {
  // data contains:
  {
    participantId: 'user_456_def',
    canEdit: true,
    participants: [...] // updated permissions
  }
});
```

**user-typing**
```javascript
socket.on('user-typing', (data) => {
  // data contains:
  {
    userId: 'socket_id',
    participantName: 'John Doe',
    isTyping: true
  }
});
```

**code-execution-result**
```javascript
socket.on('code-execution-result', (data) => {
  // data contains:
  {
    executedBy: 'John Doe',
    result: {
      success: true,
      output: 'Hello World',
      error: '',
      executionTime: 150
    },
    timestamp: '2025-08-18T10:00:00.000Z'
  }
});
```

**session-ended**
```javascript
socket.on('session-ended', () => {
  // Session has been terminated by host
  // Client should save data and redirect to summary
});
```

**session-error**
```javascript
socket.on('session-error', (data) => {
  // data contains:
  {
    error: 'Session Not Found'
  }
});
```

**connect**
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
  // Update connection status
});
```

**disconnect**
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Handle reconnection logic
});
```

## Database Schema (Future Implementation)

### Sessions Table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  room_code VARCHAR(10) UNIQUE NOT NULL,
  session_name VARCHAR(255) NOT NULL,
  language VARCHAR(50) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  max_participants INTEGER NOT NULL,
  host_id VARCHAR(255),
  edit_mode VARCHAR(20) DEFAULT 'host-only',
  code TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);
```

### Participants Table
```sql
CREATE TABLE participants (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_host BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  votes_received INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  author_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  line_number INTEGER,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Comment Votes Table
```sql
CREATE TABLE comment_votes (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  voter_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(comment_id, voter_id)
);
```

## File Structure Documentation

### Configuration Files

**package.json**
```json
{
  "name": "code_editor_",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "NODE_ENV=development node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js",
    "start:pm2": "pm2 start ecosystem.config.js --env production",
    "stop": "pm2 stop all",
    "restart": "pm2 restart all",
    "logs": "pm2 logs",
    "lint": "next lint"
  },
  "dependencies": {
    "@codemirror/basic-setup": "^0.20.0",
    "@codemirror/lang-cpp": "^6.0.3",
    "@codemirror/lang-css": "^6.3.1",
    "@codemirror/lang-html": "^6.4.9",
    "@codemirror/lang-java": "^6.0.2",
    "@codemirror/lang-javascript": "^6.2.4",
    "@codemirror/lang-json": "^6.0.2",
    "@codemirror/lang-python": "^6.2.1",
    "@codemirror/lang-sql": "^6.9.0",
    "@codemirror/state": "^6.5.2",
    "@codemirror/view": "^6.38.0",
    "@heroicons/react": "^2.2.0",
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "fs-extra": "^11.3.0",
    "next": "15.3.5",
    "node-fetch": "^3.3.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1",
    "tmp": "^0.2.3",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "prettier": "^3.6.2",
    "tailwindcss": "^4"
  }
}
```

**next.config.mjs**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
    ];
  },
  
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  output: 'standalone',
  poweredByHeader: false,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
};

export default nextConfig;
```

**ecosystem.config.js (PM2)**
```javascript
module.exports = {
  apps: [
    {
      name: 'peer-rank-code-review',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
  ],
};
```

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};
```

### Environment Variables

**.env.local (Development)**
```env
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
SESSION_CLEANUP_INTERVAL=300000
SESSION_TIMEOUT=1800000
CODE_EXECUTION_TIMEOUT=10000
MAX_CODE_LENGTH=50000
MAX_COMMENT_LENGTH=1000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

**.env.production**
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
NEXT_PUBLIC_DOMAIN=yourdomain.com
NEXT_PUBLIC_PROTOCOL=https
SESSION_CLEANUP_INTERVAL=300000
SESSION_TIMEOUT=3600000
CODE_EXECUTION_TIMEOUT=10000
MAX_CODE_LENGTH=50000
MAX_COMMENT_LENGTH=1000
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
SESSIONS_DIR=/app/data/sessions
LOGS_DIR=/app/logs
```

## Error Handling Documentation

### Client-Side Error Handling

**Socket Connection Errors**
```javascript
socketRef.current.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  setIsConnected(false);
  // Show user-friendly error message
  setError('Connection failed. Please check your internet connection.');
});

socketRef.current.on('disconnect', (reason) => {
  setIsConnected(false);
  if (reason === 'io server disconnect') {
    // Server intentionally disconnected the client
    setError('You have been disconnected from the session.');
    setTimeout(() => router.push('/'), 2000);
  } else if (reason === 'transport close' || reason === 'transport error') {
    // Network connectivity issues
    setError('Connection lost. Attempting to reconnect...');
  }
});
```

**API Request Error Handling**
```javascript
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }
  return response.json();
};

const createSession = async (sessionData) => {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
    
    return await handleApiError(response);
  } catch (error) {
    console.error('Failed to create session:', error);
    setError(`Failed to create session: ${error.message}`);
    throw error;
  }
};
```

### Server-Side Error Handling

**Socket Event Error Handling**
```javascript
socket.on('join-session', async (data) => {
  try {
    const { roomCode, participant } = data;
    
    if (!roomCode || !participant) {
      socket.emit('session-error', { 
        error: 'Invalid session data provided' 
      });
      return;
    }
    
    const session = sessionStore.get(roomCode);
    if (!session) {
      socket.emit('session-error', { 
        error: 'Session not found' 
      });
      return;
    }
    
    // Continue with join logic...
    
  } catch (error) {
    console.error('Error in join-session:', error);
    socket.emit('session-error', { 
      error: 'Internal server error' 
    });
  }
});
```

**API Route Error Handling**
```javascript
export async function POST(req) {
  try {
    const { roomCode, sessionData } = await req.json();
    
    // Validation
    if (!roomCode || !sessionData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'roomCode and sessionData are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Business logic...
    
  } catch (error) {
    console.error('Error in POST /api/session:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
```

**Code Execution Error Handling**
```javascript
async executeCode(code, language) {
  const startTime = Date.now();
  
  try {
    // Validation
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid code provided');
    }
    
    if (code.length > this.maxCodeLength) {
      throw new Error('Code too long');
    }
    
    // Execution logic...
    
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error.message,
      executionTime: Date.now() - startTime,
    };
  }
}
```

## Security Guidelines

### Input Validation

**Client-Side Validation**
```javascript
const validateRoomCode = (code) => {
  const roomCodeRegex = /^[A-Z0-9]{6}$/;
  return roomCodeRegex.test(code);
};

const validateParticipantName = (name) => {
  return name && 
         typeof name === 'string' && 
         name.trim().length >= 2 && 
         name.trim().length <= 50;
};

const validateComment = (comment) => {
  return comment && 
         typeof comment === 'string' && 
         comment.trim().length > 0 && 
         comment.trim().length <= 1000;
};
```

**Server-Side Validation**
```javascript
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

const validateSessionData = (data) => {
  const errors = [];
  
  if (!data.sessionName || data.sessionName.length < 3) {
    errors.push('Session name must be at least 3 characters');
  }
  
  if (!['javascript', 'python', 'java', 'cpp', 'html', 'css', 'sql', 'json'].includes(data.language)) {
    errors.push('Invalid programming language');
  }
  
  if (!Number.isInteger(data.duration) || data.duration < 5 || data.duration > 180) {
    errors.push('Duration must be between 5 and 180 minutes');
  }
  
  return errors;
};
```

### Rate Limiting

**Session Creation Rate Limiting**
```javascript
const rateLimitMap = new Map();

const checkRateLimit = (identifier, windowMs = 60000, maxRequests = 5) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }
  
  const requests = rateLimitMap.get(identifier);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  
  return true; // Request allowed
};
```

### Code Execution Security

**Sandboxing Configuration**
```javascript
const createSecureExecutionEnvironment = () => {
  const tempDir = path.join(os.tmpdir(), 'secure-execution', Date.now().toString());
  
  // Create isolated directory
  fs.ensureDirSync(tempDir);
  
  // Set restrictive permissions
  fs.chmodSync(tempDir, 0o700);
  
  return tempDir;
};

const cleanupExecution = (tempDir) => {
  try {
    // Force cleanup after execution
    fs.removeSync(tempDir);
  } catch (error) {
    console.warn('Failed to cleanup execution directory:', error);
  }
};
```

**Resource Limitations**
```javascript
const executeWithLimits = (command, args, options) => {
  return new Promise((resolve) => {
    const process = spawn(command, args, {
      ...options,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000, // 10 second timeout
    });
    
    let output = '';
    let error = '';
    
    // Limit output size
    const maxOutputSize = 1024 * 1024; // 1MB
    
    process.stdout.on('data', (data) => {
      output += data.toString();
      if (output.length > maxOutputSize) {
        process.kill('SIGKILL');
        resolve({
          success: false,
          output: output.substring(0, maxOutputSize),
          error: 'Output size limit exceeded',
        });
      }
    });
    
    process.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    process.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output.trim(),
        error: error.trim(),
      });
    });
    
    process.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: `Execution failed: ${err.message}`,
      });
    });
  });
};
```

This technical documentation provides comprehensive details about the API endpoints, WebSocket events, database schema, configuration files, error handling patterns, and security guidelines for the Peer Rank Code Review Platform.

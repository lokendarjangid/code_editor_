# Peer Rank - Real-Time Collaborative Code Review Platform

A Next.js-based platform for real-time collaborative code review where students can join sessions, review code, provide feedback, vote on comments, and get ranked based on the quality of their contributions.

## 🚀 Features Implemented

### ✅ Core Features (From what.txt)

#### **A. Landing Page**

- Modern, responsive design with gradient backgrounds
- "Enter Room Code" input for joining sessions
- "Create Session" button for starting new sessions
- Feature highlights and platform overview
- Mobile-responsive design with Tailwind CSS

#### **B. Join/Create Session Page**

- Session creation with unique room codes
- Language selection (JavaScript, Python, Java, C++, HTML, CSS, SQL, JSON)
- Timer setup for review sessions
- Maximum participants configuration
- Session name customization

#### **C. Live Review Room**

- **Real-time code editor** with CodeMirror integration
- **Syntax highlighting** for multiple programming languages
- **Real-time comments** with Socket.IO WebSocket integration
- **Voting system** for comment quality
- **Live participant list** with rankings
- **Session timer** with pause/resume functionality
- **Real-time synchronization** of all actions

#### **D. Post-Session Summary**

- Comprehensive session analytics
- Final participant rankings
- Top-voted comments showcase
- Session statistics (duration, comments, votes)
- Performance metrics and insights

### ⚙️ Technical Implementation

#### **Backend Components**

- **Next.js App Router** with dynamic routing
- **Socket.IO server** for real-time features
- **Custom Node.js server** with WebSocket support
- **In-memory session management** (can be extended to database)

#### **Real-time Features**

- Live code editing synchronization
- Real-time comment system
- Instant voting updates
- Participant join/leave notifications
- Typing indicators
- Connection status monitoring

#### **Programming Languages Supported**

- JavaScript (with React/Node.js examples)
- Python (with algorithm implementations)
- Java (with object-oriented examples)
- C++ (with STL and algorithms)
- HTML (with interactive web components)
- CSS (with modern styling patterns)
- SQL (with database queries)
- JSON (with API documentation)

### 📱 Responsive Design

#### **Mobile-First Approach**

- Responsive navigation and layout
- Mobile-optimized comment section
- Collapsible panels for smaller screens
- Touch-friendly interactive elements
- Adaptive typography and spacing

#### **Desktop Experience**

- Side-by-side code editor and comments
- Large code editing area
- Comprehensive participant dashboard
- Multi-column layouts for analytics

### 🔐 Additional Features

#### **User Experience**

- **Onboarding tutorial** with step-by-step guidance
- **Help system** with contextual tips
- **Report functionality** for inappropriate comments
- **Connection status** indicators
- **Session management** with end session controls

#### **Code Quality**

- **Error handling** for network issues
- **LocalStorage** for session persistence
- **Typing indicators** for better collaboration
- **Vote validation** to prevent duplicate voting
- **Comment moderation** capabilities

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **CodeMirror 6** - Advanced code editor
- **Socket.IO Client** - Real-time communication

### Backend

- **Node.js** - Server runtime
- **Socket.IO** - WebSocket server
- **Custom HTTP server** - Request handling

### Languages & Extensions

- **@codemirror/lang-javascript** - JavaScript syntax
- **@codemirror/lang-python** - Python syntax
- **@codemirror/lang-java** - Java syntax
- **@codemirror/lang-cpp** - C++ syntax
- **@codemirror/lang-html** - HTML syntax
- **@codemirror/lang-css** - CSS syntax
- **@codemirror/lang-sql** - SQL syntax
- **@codemirror/lang-json** - JSON syntax

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production

Build and start the production server:

```bash
npm run build
npm start
```

## 📋 Usage Guide

### For Session Hosts

1. Click "Create Session" from the landing page
2. Configure session settings (name, language, duration, max participants)
3. Share the generated room code with participants
4. Monitor session progress and manage participants
5. End session when complete to generate summary

### For Participants

1. Enter room code on the landing page
2. Join session with your name
3. Review the code in the editor
4. Add constructive comments and feedback
5. Vote on helpful comments from others
6. Track your ranking and score

### Best Practices

- Provide specific, actionable feedback
- Focus on code quality, performance, and readability
- Upvote genuinely helpful comments
- Stay engaged throughout the session
- Use the tutorial if you're new to the platform

## 🎯 Features Summary Checklist

| Feature                  | Status   | Description                         |
| ------------------------ | -------- | ----------------------------------- |
| ✅ Landing Page          | Complete | Modern UI with join/create options  |
| ✅ Session Creation      | Complete | Configurable session setup          |
| ✅ Real-time Code Editor | Complete | CodeMirror with syntax highlighting |
| ✅ Comment System        | Complete | Real-time commenting with voting    |
| ✅ Voting System         | Complete | Upvote quality feedback             |
| ✅ Participant Rankings  | Complete | Score-based leaderboard             |
| ✅ Session Timer         | Complete | Countdown with pause/resume         |
| ✅ Mobile Responsive     | Complete | Tailwind CSS responsive design      |
| ✅ Multiple Languages    | Complete | 8 programming languages             |
| ✅ Real-time Sync        | Complete | Socket.IO WebSocket integration     |
| ✅ Session Summary       | Complete | Analytics and final rankings        |
| ✅ Help Tutorial         | Complete | Onboarding guidance                 |
| ✅ Report System         | Complete | Flag inappropriate comments         |
| ✅ Connection Status     | Complete | Live connection monitoring          |

## 🔮 Future Enhancements

### Database Integration

- PostgreSQL or MongoDB for persistent storage
- User authentication and profiles
- Session history and analytics

### Advanced Features

- Line-specific commenting
- Code diff visualization
- GitHub/GitLab integration
- Screen sharing capabilities
- Voice/video chat integration

### Deployment

- Vercel deployment configuration
- Docker containerization
- CI/CD pipeline setup
- Environment variable management

## 📝 License

This project is part of a collaborative coding platform implementation following the specifications in `what.txt`. Built with modern web technologies for real-time collaboration and peer learning.

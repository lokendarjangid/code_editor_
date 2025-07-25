# Peer Rank - Collaborative Code Review Platform

## 🎯 Project Overview

**Peer Rank** is a real-time collaborative code review platform built with Next.js, Socket.IO, and CodeMirror. It allows students and developers to:

- Join sessions without login
- Review code snippets collaboratively
- Give and receive feedback through comments
- Vote on helpful comments
- See rankings based on feedback quality
- Track participation scores

## ✅ Implemented Features

### 🏠 **Landing Page** (`/`)

- Modern, responsive design with Tailwind CSS
- "Enter Room Code" input for joining existing sessions
- "Create Session" button for starting new sessions
- Feature showcase with icons and descriptions
- Mobile-first responsive design

### 🆕 **Session Creation** (`/create`)

- Session configuration form with:
  - Session name input
  - Programming language selection (JavaScript, Python, Java, C++, HTML, CSS)
  - Duration settings (15-90 minutes)
  - Maximum participants (5-20)
- Auto-generates unique room codes
- Responsive design for all devices

### 🔴 **Live Session Room** (`/session/[roomCode]`)

- **Real-time Code Editor** powered by CodeMirror

  - Syntax highlighting for JavaScript and Python
  - Live code synchronization across participants
  - Professional font styling and themes
  - Fallback to textarea if CodeMirror fails

- **Participants Panel**

  - Live participant list with avatars
  - Real-time ranking based on scores
  - Score calculation: (votes received × 2) + comments count
  - Medal system (🥇🥈🥉) for top performers

- **Comments System**

  - Real-time comment posting and synchronization
  - Upvoting system for quality feedback
  - Comment threading and timestamps
  - Author identification and "Your comment" indicators

- **Session Controls**
  - Live timer with pause/resume functionality
  - Connection status indicator
  - Session management (end session)
  - Back navigation

### 📊 **Session Summary** (`/summary/[roomCode]`)

- Comprehensive session analytics:
  - Duration, participant count, total comments/votes
  - Final rankings with detailed scores
  - Top-voted comments showcase
  - Session statistics and averages
- Export-ready summary view
- Action buttons for creating new sessions

### 🔧 **Real-time Backend** (`server.js`)

- **Socket.IO Server** integrated with Next.js
- Real-time event handling:
  - `join-session` - User joins a room
  - `code-change` - Live code synchronization
  - `new-comment` - Comment broadcasting
  - `vote-comment` - Vote updates with score recalculation
  - `typing` - Typing indicators
  - `end-session` - Session termination
- Session state management in memory
- Participant tracking and cleanup

### 🎨 **UI Components**

#### **CodeEditor** (`/src/components/CodeEditor.js`)

- Modern CodeMirror 6 integration
- Language support for JavaScript and Python
- Real-time collaborative editing
- Error handling with textarea fallback
- Custom theming and styling

#### **CommentSection** (`/src/components/CommentSection.js`)

- Real-time comment display
- Voting interface with visual feedback
- Empty state handling
- Author attribution and timestamps
- Mobile-responsive design

#### **ParticipantsList** (`/src/components/ParticipantsList.js`)

- Live participant tracking
- Dynamic ranking with medal system
- Score display and statistics
- Avatar generation from names
- Responsive layout

#### **SessionTimer** (`/src/components/SessionTimer.js`)

- Countdown timer with MM:SS format
- Play/pause functionality
- Color-coded time remaining (green/yellow/red)
- Session end notifications

#### **HelpTutorial** (`/src/components/HelpTutorial.js`)

- Interactive onboarding tutorial
- Step-by-step platform introduction
- Progress indicators
- Skip functionality
- Best practices guidance

## 🛠 Technical Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Node.js with Socket.IO for real-time features
- **Code Editor**: CodeMirror 6 with syntax highlighting
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: React hooks + Socket.IO for real-time sync
- **Data Storage**: localStorage for session persistence

## 📱 Mobile Responsiveness

- **Responsive Grid Layouts**: All pages adapt to mobile, tablet, and desktop
- **Touch-Friendly Interface**: Large buttons and touch targets
- **Mobile Navigation**: Simplified navigation for small screens
- **Responsive Typography**: Scalable text and spacing
- **Mobile-First Design**: Built with mobile users in mind

## 🚀 Real-Time Features

1. **Live Code Synchronization**: All participants see code changes instantly
2. **Real-Time Comments**: Comments appear immediately for all users
3. **Live Voting**: Vote counts update in real-time
4. **Participant Tracking**: Join/leave notifications
5. **Live Rankings**: Scores update dynamically based on votes
6. **Connection Status**: Visual indicators for connection state
7. **Typing Indicators**: See when others are typing

## 🎯 Scoring System

- **Comments**: +1 point per comment posted
- **Votes Received**: +2 points per upvote on your comments
- **Final Score**: (Votes × 2) + Comments Count
- **Rankings**: Sorted by score, then by participation level

## 🔒 Error Handling & Fallbacks

- **CodeMirror Fallback**: Graceful degradation to textarea
- **Connection Recovery**: Handles disconnections gracefully
- **Session Recovery**: Maintains state during reconnections
- **Error Boundaries**: Comprehensive error handling throughout
- **Loading States**: Proper loading indicators and states

## 📊 Features Comparison with Requirements

| Feature            | Status      | Implementation                             |
| ------------------ | ----------- | ------------------------------------------ |
| Landing Page       | ✅ Complete | Modern UI with join/create options         |
| Session Creation   | ✅ Complete | Full configuration with language selection |
| Live Code Editor   | ✅ Complete | CodeMirror with real-time sync             |
| Real-Time Comments | ✅ Complete | Socket.IO powered messaging                |
| Voting System      | ✅ Complete | Upvoting with live score updates           |
| Peer Rankings      | ✅ Complete | Dynamic leaderboard with medals            |
| Session Timer      | ✅ Complete | Countdown with controls                    |
| Mobile Support     | ✅ Complete | Fully responsive design                    |
| Real-Time Sync     | ✅ Complete | Socket.IO for all interactions             |
| Session Summary    | ✅ Complete | Comprehensive analytics view               |
| Help Tutorial      | ✅ Complete | Interactive onboarding                     |
| Error Handling     | ✅ Complete | Graceful fallbacks throughout              |

## 🚀 How to Run

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Access Application**:

   - Open http://localhost:3000 in your browser
   - Create a session or join with a room code
   - Start collaborating!

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## 🎉 Key Achievements

✅ **Real-time collaboration** with Socket.IO
✅ **Professional code editor** with syntax highlighting  
✅ **Comprehensive scoring system** with live rankings
✅ **Mobile-responsive design** for all devices
✅ **Error handling** with graceful fallbacks
✅ **Session management** with persistence
✅ **Interactive tutorial** for onboarding
✅ **Modern UI/UX** with Tailwind CSS
✅ **Live session analytics** and summaries
✅ **Connection status** and participant tracking

Your Peer Rank platform is now a fully functional, production-ready collaborative code review application! 🎊

# User Manual - Peer Rank Code Review Platform

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a Session](#creating-a-session)
3. [Joining a Session](#joining-a-session)
4. [Using the Code Editor](#using-the-code-editor)
5. [Commenting and Voting](#commenting-and-voting)
6. [Session Management](#session-management)
7. [Understanding Rankings](#understanding-rankings)
8. [Mobile Usage](#mobile-usage)
9. [Troubleshooting](#troubleshooting)
10. [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### What is Peer Rank?

Peer Rank is a real-time collaborative code review platform designed for educational environments, coding bootcamps, and peer learning sessions. It allows multiple participants to simultaneously review code, provide feedback, vote on comments, and receive rankings based on their contribution quality.

### System Requirements

**For Participants:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- No additional software installation required

**Supported Devices:**
- Desktop computers
- Laptops
- Tablets
- Smartphones

### Accessing the Platform

1. Open your web browser
2. Navigate to the Peer Rank platform URL
3. You'll see the landing page with options to:
   - Join an existing session
   - Create a new session

---

## Creating a Session

### Step 1: Navigate to Session Creation

1. Click the **"Create Session"** button on the landing page
2. If there's already an active session, you'll be prompted to join it instead (only one session can be active at a time)

### Step 2: Configure Session Settings

Fill out the session configuration form:

**Session Name**
- Enter a descriptive name for your review session
- Example: "JavaScript Functions Review" or "Python Algorithm Practice"

**Programming Language**
- Choose from 8 supported languages:
  - JavaScript
  - Python
  - Java
  - C++
  - C
  - HTML
  - CSS
  - SQL
  - JSON

**Duration**
- Select session length:
  - 15 minutes
  - 30 minutes
  - 45 minutes
  - 1 hour
  - 1.5 hours

**Maximum Participants**
- Choose participant limit:
  - 5 participants
  - 10 participants
  - 15 participants
  - 20 participants

### Step 3: Create and Share

1. Click **"Create Session"**
2. You'll be redirected to the session room
3. Share the 6-digit room code with participants
4. The room code is displayed at the top of the session interface

---

## Joining a Session

### Method 1: Enter Room Code

1. On the landing page, enter the 6-digit room code in the "Room Code" field
2. Click **"Join Session"**
3. Enter your name when prompted
4. Click **"Join Session"** to enter the room

### Method 2: Recent Sessions

1. If you've joined sessions before, you'll see "Recent Sessions" on the landing page
2. Click on any previous room code to quickly rejoin

### Method 3: Active Session Alert

1. If there's an active session, you'll see an alert on the landing page
2. Click **"Join Active Session"** to participate

### Joining Process

1. **Enter Your Name:** Provide a display name (2-50 characters)
2. **Connection Status:** Wait for the green "Connected" indicator
3. **Welcome Message:** You'll see a welcome message with your participant status

---

## Using the Code Editor

### Editor Interface

The code editor is located on the left side of the session interface and includes:

- **Syntax Highlighting:** Automatic highlighting based on the selected programming language
- **Line Numbers:** Clickable line numbers for adding line-specific comments
- **Code Formatting:** Built-in code formatting and auto-indentation
- **Edit Status:** Visual indicator showing if you can edit or are in view-only mode

### Editing Code

**Host Mode (Default):**
- Only the session host can edit code initially
- Host is the first person to join the session

**Collaborative Mode:**
- Host can enable collaborative editing for all participants
- Toggle between modes using the "Host" / "Collab" button (host only)

### Keyboard Shortcuts

**Code Commenting:**
- `Ctrl + /` (Windows/Linux) or `Cmd + /` (Mac): Add inline comment
- `Ctrl + Shift + /` or `Cmd + Shift + /`: Toggle line comment

**Code Formatting:**
- `Tab`: Indent code (4 spaces)
- `Shift + Tab`: Remove indentation
- `Enter`: Auto-indent new lines based on context

**Navigation:**
- Use arrow keys to navigate
- `Home` / `End`: Move to line start/end
- `Ctrl + Home` / `Ctrl + End`: Move to document start/end

### Adding Comments to Code

**Inline Comments:**
1. Place cursor where you want to add a comment
2. Press `Ctrl + /` or click the "💬 Comment" button
3. Type your comment in the dialog
4. Click "Add Comment"

**Line Comments:**
1. Click on a line number
2. Enter your comment in the dialog
3. Click "Add Comment"
4. Comments appear as speech bubble icons next to line numbers

### Code Execution

**Supported Languages:**
- JavaScript
- Python

**How to Execute:**
1. Write or modify code in the editor
2. Use the Code Execution Panel on the right
3. Click **"Run Code"**
4. View output in the results section
5. Execution results are shared with all participants

---

## Commenting and Voting

### Adding Comments

**General Comments:**
1. Scroll to the "Comments" section in the right panel
2. Type your feedback in the text area
3. Click **"Add Comment"**
4. Your comment appears immediately for all participants

**Comment Guidelines:**
- Be constructive and specific
- Focus on code quality, performance, and readability
- Provide suggestions for improvement
- Ask clarifying questions
- Maximum 1000 characters per comment

### Voting on Comments

**How to Vote:**
1. Find comments in the Comments section
2. Click the upward arrow (👍) next to helpful comments
3. Vote count increases immediately
4. You can only vote once per comment

**Voting Strategy:**
- Vote for comments that are:
  - Helpful and constructive
  - Technically accurate
  - Well-explained
  - Actionable

### Comment Features

**Author Identification:**
- Your own comments are marked as "Your comment"
- Other participants' names are displayed with their comments
- Host status is indicated

**Reporting Comments:**
- Click the flag icon to report inappropriate comments
- Use this feature for spam, harassment, or off-topic content

**Timestamps:**
- All comments show creation time
- Helps track discussion flow

---

## Session Management

### Host Controls

**As a Session Host, you can:**

**Edit Mode Control:**
- Toggle between "Host-only" and "Collaborative" editing
- Click the "Host" / "Collab" button in the header
- All participants' permissions update automatically

**Individual Permissions:**
- Grant or revoke edit permissions for specific participants
- Use the toggle switches in the Participants panel

**End Session:**
- Click the "End" button to terminate the session
- All participants are redirected to the session summary
- Session data is preserved for review

### Participant Management

**Participants Panel Shows:**
- List of all current participants
- Host designation (crown icon)
- Edit permissions status
- Individual scores and rankings
- Connection status

### Session Timer

**Timer Features:**
- Countdown display showing remaining time
- Automatic session end when time expires
- Visual progress indicator

**Timer Controls (Host only):**
- Pause timer
- Resume timer
- Extend session (if needed)

---

## Understanding Rankings

### Scoring System

**Points are awarded for:**
- **Adding Comments:** +1 point per comment
- **Receiving Votes:** +1 point per vote on your comments
- **Quality Feedback:** Bonus points for highly-voted comments

### Ranking Factors

**Contribution Quality:**
- Number of helpful comments
- Votes received from other participants
- Engagement level during session

**Participation Score:**
- Combines comment quantity and quality
- Weighted toward helpful, voted comments
- Updates in real-time during session

### Session Summary

**Final Rankings Show:**
- 🥇 🥈 🥉 Top 3 participants
- Individual scores for all participants
- Comment statistics
- Top-voted comments from the session

---

## Mobile Usage

### Mobile Interface

**Optimized Features:**
- Responsive design that adapts to screen size
- Touch-friendly controls
- Collapsible panels for better space usage
- Swipe gestures for navigation

### Mobile-Specific Controls

**Panel Management:**
- Tap "Show Panel" / "Hide Panel" to toggle right sidebar
- Panels stack vertically on mobile for better readability
- Code editor expands to full width when panels are hidden

**Touch Interactions:**
- Tap line numbers to add comments
- Touch and hold for context menus
- Pinch to zoom (if supported by browser)
- Scroll gestures work naturally

### Mobile Best Practices

1. **Use landscape orientation** for coding sessions when possible
2. **Collapse panels** when focusing on code editing
3. **Use voice-to-text** for faster comment entry
4. **Zoom as needed** for better code readability

---

## Troubleshooting

### Connection Issues

**"Connection Lost" Message:**
1. Check your internet connection
2. Refresh the browser page
3. Rejoin the session using the same room code
4. Contact the session host if problems persist

**Socket Connection Errors:**
1. Disable VPN or proxy if using one
2. Try a different browser
3. Clear browser cache and cookies
4. Check if firewall is blocking WebSocket connections

### Session Problems

**"Session Not Found" Error:**
1. Verify the room code is correct (6 characters, uppercase)
2. Check if the session has ended
3. Ask the host to create a new session
4. Try refreshing the page

**Cannot Edit Code:**
1. Check if you have edit permissions (look for "Viewer Mode" indicator)
2. Ask the host to enable collaborative mode
3. Verify you're not in a read-only session
4. Refresh the page if permissions seem incorrect

**Comments Not Appearing:**
1. Check your internet connection
2. Refresh the page to reload session state
3. Try posting the comment again
4. Verify the session is still active

### Performance Issues

**Slow Loading:**
1. Close unnecessary browser tabs
2. Disable browser extensions temporarily
3. Try using an incognito/private browsing window
4. Use a different device if available

**Code Editor Lag:**
1. Avoid very long code files (>10,000 characters)
2. Use simpler code examples for review sessions
3. Clear browser cache
4. Try a different browser

### Code Execution Problems

**"Execution Failed" Message:**
1. Check for syntax errors in your code
2. Ensure you're using a supported language (JavaScript or Python)
3. Try simpler code to test execution
4. Report persistent issues to the session host

---

## Tips and Best Practices

### For Session Hosts

**Planning Your Session:**
1. **Prepare code examples** before starting the session
2. **Set clear objectives** for what participants should review
3. **Choose appropriate duration** based on code complexity
4. **Brief participants** on the review focus areas

**During the Session:**
1. **Encourage participation** from all members
2. **Guide discussion** toward constructive feedback
3. **Manage time effectively** using the session timer
4. **Use collaborative mode** to encourage hands-on learning

**Managing Participants:**
1. **Set ground rules** for respectful feedback
2. **Moderate discussions** if they go off-topic
3. **Recognize quality contributions** publicly
4. **End sessions on time** to respect participants' schedules

### For Participants

**Providing Effective Feedback:**
1. **Be specific** about what needs improvement
2. **Suggest alternatives** rather than just pointing out problems
3. **Ask questions** to understand the code's purpose
4. **Focus on learning** rather than just finding mistakes

**Engaging Productively:**
1. **Read code carefully** before commenting
2. **Vote thoughtfully** on others' comments
3. **Ask for clarification** when needed
4. **Share your reasoning** behind suggestions

**Code Review Focus Areas:**
1. **Logic and algorithms**
2. **Code readability and style**
3. **Performance considerations**
4. **Security implications**
5. **Best practices adherence**

### General Best Practices

**Technical Tips:**
1. **Use a stable internet connection**
2. **Keep browser updated** for best performance
3. **Close unnecessary applications** during sessions
4. **Have backup communication** (chat, email) ready

**Session Etiquette:**
1. **Join on time** and stay for the full session
2. **Participate actively** but don't dominate discussion
3. **Be respectful** of different skill levels
4. **Focus on the code**, not personal coding styles

**Learning Maximization:**
1. **Take notes** during sessions for later review
2. **Ask follow-up questions** after sessions
3. **Practice implementing** suggested improvements
4. **Share resources** that might help other participants

### Advanced Features

**For Power Users:**
1. **Use keyboard shortcuts** for efficient navigation
2. **Format code** using the built-in formatter
3. **Execute code snippets** to test suggestions
4. **Add detailed inline comments** for complex logic

**Integration Ideas:**
1. **Screenshot session summaries** for later reference
2. **Share room codes** through team communication tools
3. **Schedule regular review sessions** for ongoing learning
4. **Create coding standards** based on session feedback

---

## Quick Reference

### Keyboard Shortcuts
- `Ctrl + /` or `Cmd + /`: Add inline comment
- `Ctrl + Shift + /` or `Cmd + Shift + /`: Toggle line comment
- `Tab`: Indent code
- `Shift + Tab`: Remove indentation
- `Enter`: Auto-indent new line

### Session Roles
- **Host**: First person to join, can control session settings
- **Participant**: Can view, comment, vote, and edit (if permitted)

### Voting Guidelines
- ✅ Upvote helpful, constructive comments
- ✅ Vote for technically accurate feedback
- ✅ Support well-explained suggestions
- ❌ Don't vote for your own comments
- ❌ Don't vote multiple times on same comment

### Comment Types
- **General Comments**: Overall feedback about the code
- **Line Comments**: Specific feedback about particular lines
- **Inline Comments**: Comments embedded directly in code

### Status Indicators
- 🟢 Connected / 🔴 Disconnected
- 👑 Host designation
- ✏️ Can edit / 👁️ View only
- 💬 Has comments on line

This user manual provides comprehensive guidance for effectively using the Peer Rank Code Review Platform, whether you're hosting sessions or participating in code reviews.

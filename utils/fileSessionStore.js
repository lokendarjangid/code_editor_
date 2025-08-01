const fs = require('fs-extra');
const path = require('path');

class FileSessionStore {
    constructor() {
        this.sessionDir = path.join(process.cwd(), 'tmp', 'sessions');
        // Ensure the sessions directory exists
        fs.ensureDirSync(this.sessionDir);
    }

    getSessionPath(roomCode) {
        return path.join(this.sessionDir, `${roomCode}.json`);
    }

    set(roomCode, sessionData) {
        try {
            const filePath = this.getSessionPath(roomCode);
            fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
            console.log(`Session ${roomCode} saved to file`);
            return true;
        } catch (error) {
            console.error(`Error saving session ${roomCode}:`, error);
            return false;
        }
    }

    get(roomCode) {
        try {
            const filePath = this.getSessionPath(roomCode);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                const session = JSON.parse(data);
                console.log(`Session ${roomCode} loaded from file`);
                return session;
            }
            console.log(`Session ${roomCode} not found in file storage`);
            return null;
        } catch (error) {
            console.error(`Error loading session ${roomCode}:`, error);
            return null;
        }
    }

    delete(roomCode) {
        try {
            const filePath = this.getSessionPath(roomCode);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Session ${roomCode} deleted from file`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error deleting session ${roomCode}:`, error);
            return false;
        }
    }

    has(roomCode) {
        const filePath = this.getSessionPath(roomCode);
        return fs.existsSync(filePath);
    }

    // Get all session room codes (for cleanup purposes)
    getAllRoomCodes() {
        try {
            const files = fs.readdirSync(this.sessionDir);
            return files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
        } catch (error) {
            console.error('Error getting all room codes:', error);
            return [];
        }
    }

    // Get all active sessions (sessions with participants)
    getActiveSessions() {
        try {
            const roomCodes = this.getAllRoomCodes();
            const activeSessions = [];

            roomCodes.forEach(roomCode => {
                const session = this.get(roomCode);
                if (
                    session &&
                    session.participants &&
                    Object.keys(session.participants).length > 0 &&
                    !session.isEmpty
                ) {
                    activeSessions.push({
                        roomCode,
                        participantCount: Object.keys(session.participants).length,
                        createdAt: session.createdAt,
                        sessionName: session.sessionName,
                    });
                }
            });

            return activeSessions;
        } catch (error) {
            console.error('Error getting active sessions:', error);
            return [];
        }
    }

    // Check if any active session exists
    hasActiveSession() {
        const activeSessions = this.getActiveSessions();
        return activeSessions.length > 0;
    }

    // Get the first active session
    getActiveSession() {
        const activeSessions = this.getActiveSessions();
        return activeSessions.length > 0 ? activeSessions[0] : null;
    }

    // Clean up empty or old sessions
    cleanup() {
        try {
            const roomCodes = this.getAllRoomCodes();
            let cleaned = 0;
            const now = new Date();
            const EMPTY_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

            roomCodes.forEach(roomCode => {
                const session = this.get(roomCode);
                if (!session) {
                    this.delete(roomCode);
                    cleaned++;
                    return;
                }

                // Check if session is empty and has been empty for too long
                if (session.isEmpty && session.lastActivity) {
                    const lastActivity = new Date(session.lastActivity);
                    const timeSinceEmpty = now - lastActivity;

                    if (timeSinceEmpty > EMPTY_SESSION_TIMEOUT) {
                        console.log(
                            `Cleaning up empty session ${roomCode} - empty for ${Math.round(timeSinceEmpty / 60000)} minutes`
                        );
                        this.delete(roomCode);
                        cleaned++;
                    }
                } else if (!session.participants || Object.keys(session.participants).length === 0) {
                    // Legacy cleanup for sessions without isEmpty flag
                    this.delete(roomCode);
                    cleaned++;
                }
            });

            if (cleaned > 0) {
                console.log(`Cleaned up ${cleaned} old/empty sessions`);
            }

            return cleaned;
        } catch (error) {
            console.error('Error during cleanup:', error);
            return 0;
        }
    }
}

// Create and export singleton instance
const fileSessionStore = new FileSessionStore();

module.exports = fileSessionStore;

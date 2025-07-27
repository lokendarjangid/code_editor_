// Shared session storage for both server and API routes
class SessionStore {
    constructor() {
        this.sessions = new Map();
    }

    set(roomCode, sessionData) {
        this.sessions.set(roomCode, sessionData);
        console.log(`Session stored: ${roomCode}`, Object.keys(sessionData));
    }

    get(roomCode) {
        const session = this.sessions.get(roomCode);
        console.log(`Session retrieved: ${roomCode}`, session ? 'found' : 'not found');
        return session;
    }

    delete(roomCode) {
        const deleted = this.sessions.delete(roomCode);
        console.log(`Session deleted: ${roomCode}`, deleted ? 'success' : 'not found');
        return deleted;
    }

    has(roomCode) {
        return this.sessions.has(roomCode);
    }

    size() {
        return this.sessions.size;
    }

    keys() {
        return Array.from(this.sessions.keys());
    }
}

// Create a singleton instance
const sessionStore = new SessionStore();

module.exports = sessionStore;

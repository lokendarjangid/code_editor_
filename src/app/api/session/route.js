// Import shared session store
const sessionStore = require('../../../../utils/fileSessionStore');

export async function POST(req) {
    try {
        const { roomCode, sessionData } = await req.json();
        if (!roomCode || !sessionData) {
            return new Response(JSON.stringify({ success: false, error: 'roomCode and sessionData are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if there's already an active session
        if (sessionStore.hasActiveSession()) {
            const activeSession = sessionStore.getActiveSession();
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Only one session can be active at a time',
                    activeSession: {
                        roomCode: activeSession.roomCode,
                        sessionName: activeSession.sessionName,
                        participantCount: activeSession.participantCount,
                    },
                }),
                {
                    status: 409, // Conflict
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        sessionStore.set(roomCode, sessionData);
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in POST /api/session:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const roomCode = searchParams.get('roomCode');
        if (!roomCode) {
            return new Response(JSON.stringify({ success: false, error: 'roomCode is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const session = sessionStore.get(roomCode);
        if (!session) {
            return new Response(JSON.stringify({ success: false, error: 'Session not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ success: true, session }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in GET /api/session:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

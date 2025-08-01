// Import shared session store
const sessionStore = require('../../../../../utils/fileSessionStore');

export async function GET() {
    try {
        const activeSessions = sessionStore.getActiveSessions();
        return new Response(
            JSON.stringify({
                success: true,
                activeSessions,
                hasActiveSession: activeSessions.length > 0,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in GET /api/session/active:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

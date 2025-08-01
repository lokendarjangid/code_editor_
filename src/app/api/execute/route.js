import CodeExecutor from '../../../../utils/codeExecutor';

const codeExecutor = new CodeExecutor();

export async function POST(req) {
    try {
        const { code, language } = await req.json();
        if (!code || !language) {
            return new Response(JSON.stringify({ success: false, error: 'Code and language are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const result = await codeExecutor.executeCode(code, language);
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in POST /api/execute:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

const MODELS = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body || {};
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages must be a non-empty array' });
    }

    const debugErrors = [];
    
    // First try standard high quality models
    for (const model of MODELS) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: 0.7,
                    max_tokens: 300
                })
            });

            const data = await response.json();

            if (response.ok && data?.choices?.length > 0) {
                return res.status(200).json(data);
            }
            debugErrors.push({ model, status: response.status, error: data?.error?.message || data?.error });
        } catch (error) {
            debugErrors.push({ model, error: error.message });
        }
    }

    // Dynamic discovery fallback: query Groq for all active models
    try {
        const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const modelsData = await modelsRes.json();
        
        if (modelsData?.data?.length > 0) {
            const availableModels = modelsData.data
                .map(m => m.id)
                .filter(id => !id.includes('whisper') && !id.includes('guard'));

            for (const model of availableModels) {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.7,
                        max_tokens: 300
                    })
                });

                const data = await response.json();
                if (response.ok && data?.choices?.length > 0) {
                    return res.status(200).json(data);
                }
            }
            return res.status(500).json({ 
                error: 'No active Groq chat model worked', 
                availableModels, 
                debugErrors 
            });
        }
    } catch (e) {
        debugErrors.push({ dynamicDiscoveryError: e.message });
    }

    return res.status(500).json({ error: 'All Groq models failed', attempts: debugErrors });
}

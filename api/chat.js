const MODELS = ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];

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

    let lastError = null;
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
            lastError = data?.error?.message || `Model ${model} failed`;
        } catch (error) {
            lastError = error.message;
        }
    }

    return res.status(500).json({ error: lastError || 'Failed to fetch from Groq' });
}

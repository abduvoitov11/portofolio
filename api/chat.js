const MODELS = ['qwen/qwen3.8-27b', 'allam-2-7b', 'openai/gpt-oss-20b'];

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

    // Try primary models
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
        } catch (error) {
            // continue to fallback
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
        }
    } catch (e) {
        // fallback
    }

    // Graceful fallback response if all external AI models are down
    const userMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let reply = "Salom! Men Torabek Abduvoitovning AI yordamchisiman. Torabek — AI Developer va Python dasturchisi. U Machine Learning, Telegram botlar va Full-Stack loyihalar yaratishga ixtisoslashgan. Bog'lanish: rgobzpe@gmail.com";

    if (userMsg.includes('loyiha') || userMsg.includes('project') || userMsg.includes('ish')) {
        reply = "Torabekning eng so'nggi yirik loyihasi — 'Kiloli OPTOM' (optom-six.vercel.app). Shuningdek u ko'plab AI botlar va Web ilovalar ustida ishlagan.";
    } else if (userMsg.includes('aloqa') || userMsg.includes('kontakt') || userMsg.includes('boglanish') || userMsg.includes('email') || userMsg.includes('telegram')) {
        reply = "Torabek bilan bog'lanish uchun: Email: rgobzpe@gmail.com yoki GitHub: https://github.com/abduvoitov11";
    } else if (userMsg.includes('dino') || userMsg.includes('oyun') || userMsg.includes('o\'yin')) {
        reply = "Saytda o'ynash uchun maxsus Cyber Dino o'yini mavjud! Bosh sahifadagi 'Dino o'ynash' tugmasini bosib o'ynashingiz mumkin.";
    }

    return res.status(200).json({
        choices: [
            {
                message: {
                    role: "assistant",
                    content: reply
                }
            }
        ]
    });
}

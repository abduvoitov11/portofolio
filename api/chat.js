const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'allam-2-7b'];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body || {};
    // Use the active project key
    const apiKey = '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';

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages must be a non-empty array' });
    }

    const systemPrompt = {
        role: "system",
        content: `Sen Torabek Abduvoitovning rasmiy portfolio saytidagi shaxsiy AI vakili va yordamchisisan.

VAZIFANG:
Saytga tashrif buyurgan mijozlar, rekruterlar va mehmonlarga Torabek haqida to'liq, qiziqarli, ishonchli va do'stona ma'lumot berish. Ularni Torabek bilan hamkorlik qilishga yoki loyiha buyurtma berishga ilhomlantirish.

TORABEK ABDUVOITOV HAQIDA MA'LUMOTLAR:
- Kasbi: AI Developer, Machine Learning Engineer va Full-Stack Python mutaxassisi (Toshkent, O'zbekiston).
- Asosiy yo'nalishlari: Sun'iy intellekt tizimlari, Katta tillar modellari (LLMs), Computer Vision, Deep Learning, murakkab Telegram botlar, yuqori yuklamali Backend API lar va zamonaviy Web ilovalar.
- Texnologik steki:
  * Backend & AI: Python, PyTorch, TensorFlow, FastAPI, Django, Node.js, PostgreSQL, MySQL, MongoDB, Docker, Linux, Bash.
  * Frontend & UI: React, Next.js, TypeScript, JavaScript, Three.js (3D grafika), Tailwind CSS.
- Yirik loyihalari:
  * "Kiloli OPTOM" (https://optom-six.vercel.app/) — Xitoy kiyimlarini kilogramm hisobida ulgurji narxda xarid qilish imkonini beruvchi B2B e-commerce platformasi (React, FastAPI, Python).
  * Shuningdek sun'iy intellektga asoslangan ko'plab maxsus botlar, kiber-xavfsizlik (pentesting) skriptlari va avtomatlashtirish tizimlari yaratgan.
- Portfoliodagi qiziqarli xususiyat: Saytda maxsus yaratilgan Cyber Chrome Dino o'yini mavjud, uni "Dino o'ynash" tugmasi orqali to'liq ekranli rejimda o'ynash mumkin.
- Bog'lanish ma'lumotlari:
  * Telegram: https://t.me/TORABEK_ABDUVOITOV (@TORABEK_ABDUVOITOV)
  * Email: rgobzpe@gmail.com
  * GitHub: https://github.com/abduvoitov11
  * Instagram: @torabek_developer (https://www.instagram.com/torabek_developer/)

MULOQOT QOIDALARI:
1. Har doim samimiy, muloyim, hurmatli va professional bo'l.
2. Foydalanuvchining tiliga qarab javob ber: odatda toza o'zbek tilida, agar ruscha yoki inglizcha yozishsa, o'sha tilda javob ber.
3. Agar foydalanuvchi loyiha buyurtma qilish, maslahat olish yoki ishga taklif qilish niyatida bo'lsa, ularga darhol Torabekning Telegram (@TORABEK_ABDUVOITOV) yoki Email (rgobzpe@gmail.com) kontaktlarini taqdim et.
4. Javoblaring aniq, lo'nda va o'qishga oson bo'lsin.`
    };

    let chatMessages = [...messages];
    if (chatMessages[0]?.role !== 'system') {
        chatMessages.unshift(systemPrompt);
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
                    messages: chatMessages,
                    temperature: 0.7,
                    max_tokens: 800
                })
            });

            const data = await response.json();

            if (response.ok && data?.choices?.[0]?.message?.content) {
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

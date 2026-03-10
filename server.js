require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '')));

app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const key = process.env.NVIDIA_API_KEY;
    if (!key) {
        return res.status(500).json({ error: 'API key not configured.' });
    }

    const modelsToTry = [
        process.env.NVIDIA_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct',
        'meta/llama-3.1-70b-instruct',
        'meta/llama3-8b-instruct'
    ];

    let lastError = null;
    let lastStatus = 500;

    for (const model of modelsToTry) {
        try {
            const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: req.body.messages,
                    max_tokens: 150,
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                const errBody = await response.text();
                lastError = errBody;
                lastStatus = response.status;

                // If it's a 404 (Not Found for account), try the next model silently to avoid terminal spam.
                // Otherwise, it might be a 401 (Invalid Key) or 429 (Rate Limit), so we log and abort early.
                if (response.status === 404) {
                    continue;
                } else {
                    console.error(`NVIDIA API Error with ${model}:`, response.status, errBody);
                    return res.status(response.status).json({ error: `API Error: ${response.status}`, details: errBody });
                }
            }

            const data = await response.json();
            return res.json(data);
        } catch (error) {
            console.error(`Backend fetch error with ${model}:`, error);
            lastError = error.message;
        }
    }

    // If all models failed
    res.status(lastStatus).json({ error: 'Failed to communicate with NVIDIA API across multiple model fallbacks', details: lastError });
});

app.post('/api/save-idea', (req, res) => {
    const { idea } = req.body;
    if (!idea) {
        return res.status(400).json({ error: 'No idea provided' });
    }

    const timestamp = new Date().toISOString();
    const contentToSave = `\n--- [${timestamp}] SYNTHESIZED BREAKTHROUGH ---\n${idea}\n-------------------------------------------------\n`;

    const filePath = path.join(__dirname, 'finalized_ideas.txt');

    fs.appendFile(filePath, contentToSave, (err) => {
        if (err) {
            console.error("Error saving idea:", err);
            return res.status(500).json({ error: 'Failed to save the idea locally' });
        }
        res.json({ success: true, message: 'Idea archived successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Please ensure you have set your NVIDIA_API_KEY in the .env file.');
});

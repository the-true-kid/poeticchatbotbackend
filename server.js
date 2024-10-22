const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.post('/api/reflection', async (req, res) => {
    const { responses } = req.body;

    const prompt = `
      You are a poetic muse. Here are the user's thoughts:
      ${responses.map((response) => `• ${response.answer}`).join('\n')}
      Please respond with a short poetic reflection.
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.8,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        res.json({ reflection: response.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Error generating reflection:', error.message);
        res.status(500).send('Error generating reflection');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

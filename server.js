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
      Imagine yourself walking through a house that reflects the owner's mind and spirit. 
      Your task is to describe this house in exactly four poetic sentences. Use sensory and metaphorical language to make it immersive.
      Ensure each sentence flows smoothly into the next, and the reflection ends naturally.

      Here are the user's responses:
      ${responses.map((response) => `• "${response.answer}"`).join('\n')}

      Please respond in exactly four sentences, with no trailing or incomplete thoughts.
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200,  // Limits to approximately four sentences
                temperature: 0.8,  // Keep it creative but coherent
                presence_penalty: 0.5,
                frequency_penalty: 0.3,
                stop: ["\n"],  // Ensures the response stops naturally after four sentences
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const reflection = response.data.choices[0].message.content.trim();
        res.json({ reflection });
    } catch (error) {
        console.error('Error generating reflection:', error.message);
        res.status(500).json({ error: 'Error generating reflection. Please try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. PASTE YOUR KEY FROM THE WEBSITE BELOW
const API_KEY = 'dh6vnKYWxlD4nDIkYr632MkammIrKbTO';

app.post('/api/scan', async (req, res) => {
    const { url } = req.body;
    console.log(`Scanning URL: ${url}`);

    try {
        // This line sends the URL to the IPQualityScore "Brain"
        const response = await axios.get(`https://www.ipqualityscore.com/api/json/url/${API_KEY}/${encodeURIComponent(url)}`);
        const data = response.data;

        // This sends the real-time data back to your website UI
        res.json({
            status: data.unsafe ? 'PHISHING' : 'SAFE',
            score: data.risk_score || 0,
            label: data.unsafe ? 'High Risk' : 'Verified Safe',
            reasons: [
                `Final Destination: ${data.final_url || 'N/A'}`,
                `Phishing Detected: ${data.phishing ? 'YES' : 'No'}`,
                `Malware Detected: ${data.malware ? 'YES' : 'No'}`,
                `Server: ${data.server || 'Unknown'}`
            ],
            severity: data.risk_score > 75 ? 'rose' : (data.risk_score > 40 ? 'amber' : 'emerald')
        });
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: "API scan failed." });
    }
});

app.listen(3001, () => {
    console.log('------------------------------------');
    console.log('🚀 PHISHGUARD BACKEND STARTING...');
    console.log('📡 Listening on http://localhost:3001');
    console.log('------------------------------------');
});
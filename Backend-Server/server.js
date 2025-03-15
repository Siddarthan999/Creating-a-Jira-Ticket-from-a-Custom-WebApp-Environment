const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

async function createJiraTicket(summary, description, issueType) {
    try {
        const response = await axios.post(`${process.env.JIRA_URL}/rest/api/3/issue`, {
            fields: {
                project: { key: process.env.JIRA_PROJECT_KEY },
                summary: summary,
                description: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: description }] }] },
                issuetype: { name: issueType}
            }
        }, {
            auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_AUTH_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Jira Ticket Created:', response.data);
    } catch (error) {
        console.error('Error creating Jira ticket:', error.response?.data || error.message);
    }
}

app.post('/create-jira', async (req, res) => {
    const { summary, description, issueType } = req.body;
    await createJiraTicket(summary, description, issueType);
    res.send({ message: 'Jira ticket created' });
});

app.listen(3000, () => console.log('Server running on port 3000'));

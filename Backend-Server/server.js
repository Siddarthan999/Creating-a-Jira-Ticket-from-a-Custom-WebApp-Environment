const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const userTickets = {}; // Stores { username: jiraIssueKey } mapping

async function createJiraTicket(username, summary, description, issueType) {
    try {
        const response = await axios.post(`${process.env.JIRA_URL}/rest/api/3/issue`, {
            fields: {
                project: { key: process.env.JIRA_PROJECT_KEY },
                summary: summary,
                description: { 
                    type: "doc", 
                    version: 1, 
                    content: [{ type: "paragraph", content: [{ type: "text", text: description }] }]
                },
                issuetype: { name: issueType }
            }
        }, {
            auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_AUTH_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        });

        const issueKey = response.data.key;
        userTickets[username] = issueKey; // Store ticket ID for this user

        console.log(`Jira Ticket Created: ${issueKey} for user ${username}`);
        return issueKey;
    } catch (error) {
        console.error('Error creating Jira ticket:', error.response?.data || error.message);
    }
}

async function updateJiraTicket(issueKey, updatedDescription) {
    try {
        await axios.put(`${process.env.JIRA_URL}/rest/api/3/issue/${issueKey}`, {
            fields: {
                description: { 
                    type: "doc", 
                    version: 1, 
                    content: [{ type: "paragraph", content: [{ type: "text", text: updatedDescription }] }]
                }
            }
        }, {
            auth: { username: process.env.JIRA_EMAIL, password: process.env.JIRA_AUTH_TOKEN },
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`Jira Ticket Updated: ${issueKey}`);
    } catch (error) {
        console.error('Error updating Jira ticket:', error.response?.data || error.message);
    }
}

app.post('/create-jira', async (req, res) => {
    const { username, summary, description, issueType } = req.body;
    const issueKey = await createJiraTicket(username, summary, description, issueType);
    res.send({ message: 'Jira ticket created', issueKey });
});

app.post('/update-jira', async (req, res) => {
    const { username, updatedDescription } = req.body;
    const issueKey = userTickets[username];

    if (!issueKey) {
        return res.status(400).send({ message: "No existing Jira ticket found for user" });
    }

    await updateJiraTicket(issueKey, updatedDescription);
    res.send({ message: 'Jira ticket updated' });
});

app.listen(3000, () => console.log('Server running on port 3000'));

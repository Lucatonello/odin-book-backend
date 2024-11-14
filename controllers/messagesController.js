const db = require('../db/pool');

const messagesController = {
    getMessages: async (req, res) => {
        const userid = req.params.userid;

        try {
            const result = await db.query(`
                SELECT 
                    CASE 
                        WHEN messages.senderid = $1 THEN receiver.username
                        ELSE sender.username
                    END AS contact_username,
                    CASE 
                        WHEN messages.senderid = $1 THEN receiver.id
                        ELSE sender.id
                    END AS contact_id,
                    messages.text AS last_message,
                    messages.id 
                FROM messages
                JOIN users AS sender ON messages.senderid = sender.id
                JOIN users AS receiver ON messages.receiverid = receiver.id
                WHERE $1 IN (messages.senderid, messages.receiverid)
                ORDER BY messages.id DESC
                LIMIT 1;
            `, [userid]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting messages from databsae');
        }
    },
    getChatDetails: async (req, res) => {
        const chatid = req.params.chatid;

        try {
            const result = await db.query(`
                SELECT 
                    u.username,
                    u.summary,
                    m.*
                FROM messages m
                JOIN users u ON m.senderid = u.id
                WHERE m.id = $1
            `, [chatid]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting chat messages');
        }
    }
}

module.exports= { messagesController };
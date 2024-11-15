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

                    (SELECT senderid 
                    FROM messages 
                    WHERE (senderid = $1 OR receiverid = $1) 
                    ORDER BY id ASC 
                    LIMIT 1) AS first_sender_id,

                    (SELECT receiverid 
                    FROM messages 
                    WHERE (senderid = $1 OR receiverid = $1) 
                    ORDER BY id ASC 
                    LIMIT 1) AS first_receiver_id,

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
        const chatid1 = req.params.chatId1;
        const chatid2 = req.params.chatId2;

        try {
            const result = await db.query(`
                SELECT 
                    u.username,
                    u.summary,
                    m.*
                FROM messages m
                JOIN users u ON m.senderid = u.id
                WHERE 
                    (LEAST (m.senderid, m.receiverid) = $1 AND GREATEST (m.senderid, m.receiverid) = $2)
                ORDER BY m.id ASC
            `, [chatid1, chatid2]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting chat messages');
        }
    },
    sendMessage: async (req, res) => {
        const senderid = req.params.senderid;
        const receiverid = req.params.receiverid;

        const text = req.body.newMessage;

        try {
            const result = await db.query(`
                INSERT INTO messages
                (senderid, receiverid, text)
                VALUES ($1, $2, $3)
            `, [senderid, receiverid, text]);

            res.json({ isDone: true, newMessage: text });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error sending message');
        }
    }
}

module.exports= { messagesController };
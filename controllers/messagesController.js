const db = require('../db/pool');

const messagesController = {
    getMessages: async (req, res) => {
        const userid = req.params.userid;

        try {
            const result = await db.query(`
                SELECT DISTINCT ON (LEAST(m.senderid, m.receiverid), GREATEST(m.senderid, m.receiverid)) 
                    m.id, 
                    m.senderid AS first_sender_id, 
                    m.receiverid AS first_receiver_id, 
                    m.text as last_message, 
                    u.username AS contact_username
                FROM messages m
                JOIN users u 
                    ON u.id = CASE 
                                WHEN m.senderid = $1 THEN m.receiverid 
                                ELSE m.senderid 
                            END
                WHERE m.senderid = $1 OR m.receiverid = $1
                ORDER BY LEAST(m.senderid, m.receiverid), GREATEST(m.senderid, m.receiverid), m.id DESC;
            `, [userid]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting messages from databsae');
        }
    },
    getChatDetails: async (req, res) => {
        const chatid1 = req.params.chatId1;
        const chatid2 = req.params.chatid2;
        
        try {
            const result = await db.query(`
               SELECT m.id, m.text, m.senderid, m.receiverid, u.username
               FROM messages m
               JOIN users u ON m.senderid = u.id
               WHERE 
                   (m.senderid = $1 AND m.receiverid = $2)
                OR
                   (m.senderid = $2 AND m.receiverid = $1)
                ORDER BY m.id
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
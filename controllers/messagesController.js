const db = require('../db/pool');

const messagesController = {
    getMessages: async (req, res) => {
        const userid = req.params.userid;

        try {
            const result = await db.query(`
                SELECT DISTINCT ON (LEAST(m.senderid, m.receiverid), GREATEST(m.senderid, m.receiverid)) 
                    m.id, 
                    m.senderid, 
                    m.receiverid, 
                    m.text as last_message, 
                    u.username AS contact_username,

                    (SELECT senderid 
                    FROM messages 
                    WHERE (senderid = $1 OR receiverid = $1) 
                    ORDER BY id ASC 
                    LIMIT 1) AS first_sender_id

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
        
        try {
            const result = await db.query(`
               SELECT 
                    CASE 
                        WHEN messages.senderid = $1 THEN receiver.username
                        ELSE sender.username
                    END AS contact_username,
                    CASE 
                        WHEN messages.senderid = $1 THEN messages.receiverid
                        ELSE messages.senderid
                    END AS contact_id,
                    messages.text AS last_message,
                    messages.id AS last_message_id
                FROM (
                    SELECT DISTINCT ON (
                        LEAST(senderid, receiverid), 
                        GREATEST(senderid, receiverid)
                    ) *
                    FROM messages
                    WHERE $1 IN (senderid, receiverid)
                    ORDER BY LEAST(senderid, receiverid), 
                            GREATEST(senderid, receiverid), 
                            id DESC
                ) AS messages
                JOIN users AS sender ON messages.senderid = sender.id
                JOIN users AS receiver ON messages.receiverid = receiver.id
                ORDER BY messages.id DESC;
            `, [chatid1]);

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
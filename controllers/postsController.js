const db = require('../db/pool');

const postsController = {
    getAllPosts: async (req, res) => {
        try {
            const result = await db.query(`
                SELECT 
                    p.id,
                    p.text AS text,
                    COALESCE(u.username, c.name) AS author_name,
                    p.date AS post_date,
                    COUNT(l.id) AS total_likes,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'authorOrcompanyName', COALESCE(u_comment.username, c_comment.name),
                            'text', co.text
                        )
                    ) AS comments
                FROM 
                    posts p
                LEFT JOIN 
                    users u ON p.authorid = u.id
                LEFT JOIN 
                    companies c ON p.companyid = c.id
                LEFT JOIN 
                    comments co ON co.postid = p.id
                LEFT JOIN 
                    users u_comment ON co.authorid = u_comment.id
                LEFT JOIN 
                    companies c_comment ON co.companyid = c_comment.id
                LEFT JOIN 
                    likes l ON l.postid = p.id
                GROUP BY 
                    p.id, p.text, u.username, c.name, p.date
                ORDER BY 
                    p.date DESC;

            `);
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'failed to get all posts' });
        }
    },
    addOneLike: async (req, res) => {
        const id = req.body.id;
        const postid = req.body.postid;
        const type = req.body.type;

        if (type == 'user') {
            try {
                await db.query(`
                    INSERT INTO likes
                    (authorid, postid)
                    VALUES ($1, $2)
                `, [id, postid]);
            } catch (err) {
                console.error(err);
                res.status(500).send('error adding like');
            }
        } else if (type == 'company') {
            try {
                await db.query(`
                    INSERT INTO likes
                    (companyid, postid)
                    VALUES ($1, $2)
                `, [id, postid]);
            } catch (err) {
                console.error(err);
                res.status(500).send('error adding like');
            }
        }
    }
};

module.exports = { postsController };
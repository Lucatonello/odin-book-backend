const db = require('../db/pool');

const postsController = {
    getAllPosts: async (req, res) => {
        try {
            const result = await db.query(`
                SELECT 
                    p.id,
                    p.text AS text,
                    COALESCE(u.username, c.name) AS author_name,
                    u.summary AS author_summary,
                    COALESCE(u.id, c.id) AS author_id,
                    
                    CASE 
                        WHEN u.id IS NOT NULL THEN 'user'
                        ELSE 'company'
                    END AS type,   

                    p.date AS post_date,
                    COUNT(DISTINCT l.id) AS total_likes,
                    COALESCE(
                        (
                            SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'authorName', COALESCE(u_comment.username, c_comment.name),
                                    'authorSummary', u_comment.summary,
                                    'text', co.text,
                                    'postid', co.postid,
                                    'authorid', COALESCE(u_comment.id, c_comment.id),
                                    'type', CASE 
                                        WHEN u_comment.id IS NOT NULL THEN 'user'
                                        ELSE 'company'
                                    END  
                                )
                            )
                FROM comments co
                    LEFT JOIN users u_comment ON co.authorid = u_comment.id
                    LEFT JOIN companies c_comment ON co.companyid = c_comment.id
                    WHERE co.postid = p.id
                ),
                '[]'
                ) AS comments
            FROM 
                posts p
            LEFT JOIN 
                users u ON p.authorid = u.id
            LEFT JOIN 
                companies c ON p.companyid = c.id
            LEFT JOIN 
                likes l ON l.postid = p.id
            GROUP BY 
                p.id, p.text, u.username, c.name, u.id, c.id, p.date, u.summary
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
        let {id, postid, type} = req.body;

        let idColumn = type == 'user' ? 'authorid' : type =='company' ? 'companyid' : null;
        
        if (!idColumn) {
            return res.status(400).send('Invalid type');
        }

        try {
            await db.query(`
                INSERT INTO likes
                (${idColumn}, postid)
                VALUES ($1, $2)
            `, [id, postid]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding like');
        }
    },
    addComment: async (req, res) => {
        const {newComment, id, postid, type} = req.body;
        if (type == 'user') {
            try {
                await db.query(`
                    INSERT INTO comments
                    (text, authorid, companyid, postid)
                    VALUES ($1, $2, NULL, $3)
                `, [newComment, id, postid])
            } catch (err) {
                console.error(err);
                res.stats(500).send('error adding comment to the db')
            }
        } else if (type == 'company') {
            try {
                await db.query(`
                    INSERT INTO comments
                    (text, authorid companyid, postid)
                    VALUES ($1, NULL, $2, $3)
                `, [newComment, id, postid])
            } catch (err) {
                console.error(err);
                res.stats(500).send('error adding comment to the db')
            }
        }
    },
    newPost: async (req, res) => {
        const {newPost, id, type} = req.body;

        // let day = date.getDate()
        // let month = date.getMonth() + 1
        // let year = date.getFullYear()
        // let fullDate = `${month}-${day}-${year}`

        if (type == 'user') {
            try {
                await db.query(`
                    INSERT INTO posts
                    (text, authorid)
                    VALUES ($1, $2)
                `, [newPost, id]);
            } catch (err) {
                console.error(err);
                res.stats(500).send('error adding post to the db')
            }
        } else if (type == 'company') {
            try {
                await db.query(`
                    INSERT INTO posts
                    (text, companyid)
                    VALUES ($1, $2)
                `, [newPost, id])
            } catch (err) {
                console.error(err);
                res.stats(500).send('error adding post to the db')
            }   
        } 
    }
};

module.exports = { postsController };
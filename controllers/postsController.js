const db = require('../db/pool');

const postsController = {
    getAllPosts: async (req, res) => {
        const userid = req.params.userid;
        const type = req.params.type;

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

                    CASE 
                        WHEN EXISTS (
                            SELECT 1 
                            FROM likes l_check 
                            WHERE l_check.postid = p.id 
                            AND (
                                ($2 = 'user' AND l_check.authorid = $1) OR 
                                ($2 = 'company' AND l_check.companyid = $1)
                            )
                        ) THEN true
                        ELSE false
                    END AS has_liked,

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
            `, [userid, type]);
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

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding like');
        }
    },
    addComment: async (req, res) => {
        const {newComment, id, postid, type} = req.body;

        console.log('')
        if (type == 'user') {
            try {
                await db.query(`
                    INSERT INTO comments
                    (text, authorid, companyid, postid)
                    VALUES ($1, $2, NULL, $3)
                `, [newComment, id, postid])

                res.json({ isDone: true });
            } catch (err) {
                console.error(err);
                res.status(500).send('error adding comment to the db')
            }
        } else if (type == 'company') {
            try {
                await db.query(`
                    INSERT INTO comments
                    (text, authorid, companyid, postid)
                    VALUES ($1, NULL, $2, $3)
                `, [newComment, id, postid]);

                res.json({ isDone: true });
            } catch (err) {
                console.error(err);
                res.status(500).send('error adding comment to the db')
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
                res.json({ isDone: true });
            } catch (err) {
                console.error(err);
                res.status(500).send('error adding post to the db')
            }
        } else if (type == 'company') {
            try {
                await db.query(`
                    INSERT INTO posts
                    (text, companyid)
                    VALUES ($1, $2)
                `, [newPost, id]);
                res.json({ isDone: true });
            } catch (err) {
                console.error(err);
                res.status(500).send('error adding post to the db')
            }   
        } 
    },
    getMemberNotifications: async (req, res) => {
        const memberid = req.params.memberid;
        const type = req.params.type;

        try {
            const likes = await db.query(`
                SELECT 
                    l.id,
                    l.postid,
                    COALESCE(u.id, c.id) AS liker_id,
                    COALESCE(u.username, c.name) AS liker_name,
                    u.summary AS liker_summary,
                    CASE 
                        WHEN u.id IS NOT NULL THEN 'user'
                        WHEN c.id IS NOT NULL THEN 'company'
                    END AS liker_type
                FROM likes l
                JOIN posts p ON l.postid = p.id
                LEFT JOIN users u ON l.authorid = u.id
                LEFT JOIN companies c ON l.companyid = c.id
                WHERE ${type === 'user' ? 'p.authorid' : 'p.companyid'} = $1
                AND (l.authorid IS NOT NULL OR l.companyid IS NOT NULL)
            `, [memberid]);

            const comments = await db.query(`
                SELECT 
                    cmt.id,
                    cmt.postid,
                    COALESCE(u.id, co.id) AS commenter_id,
                    COALESCE(u.username, co.name) AS commenter_name,
                    u.summary AS commenter_summary,
                    CASE 
                        WHEN u.id IS NOT NULL THEN 'user'
                        WHEN co.id IS NOT NULL THEN 'company'
                    END AS commenter_type
                FROM comments cmt
                JOIN posts p ON cmt.postid = p.id
                LEFT JOIN users u ON cmt.authorid = u.id
                LEFT JOIN companies co ON cmt.companyid = co.id
                WHERE ${type === 'user' ? 'p.authorid' : 'p.companyid'} = $1
                AND (cmt.authorid IS NOT NULL OR cmt.companyid IS NOT NULL)
            `, [memberid]);

            const follows = await db.query(`
                SELECT
                    COALESCE(u.id, c.id) AS follower_id,
                    CASE 
                        WHEN u.id IS NOT NULL THEN 'user'
                        WHEN c.id IS NOT NULL THEN 'company'
                    END AS follower_type,
                    COALESCE(u.username, c.name) AS follower_name,
                    u.summary AS follower_summary
                FROM follows f
                LEFT JOIN users u ON f.giverid = u.id AND f.givertype = 'user'
                LEFT JOIN companies c ON f.giverid = c.id AND f.givertype = 'company'
                WHERE f.receiverid = $1 AND f.receivertype = ${type === 'user' ? "'user'" : "'company'"}
            `, [memberid]);

            res.json({ likes: likes.rows, comments: comments.rows, follows: follows.rows });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting member notifications');
        }
    },
    getPostData: async (req, res) => {
        const postid = req.params.postid;
        const userid = req.params.userid;
        const type = req.params.type;

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

                    CASE 
                        WHEN EXISTS (
                            SELECT 1 
                            FROM likes l_check 
                            WHERE l_check.postid = p.id 
                            AND (
                                ($3 = 'user' AND l_check.authorid = $2) OR 
                                ($3 = 'company' AND l_check.companyid = $2)
                            )
                        ) THEN true
                        ELSE false
                    END AS has_liked,

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
                WHERE
                    p.id = $1
                GROUP BY 
                    p.id, p.text, u.username, c.name, u.id, c.id, p.date, u.summary
                ORDER BY 
                    p.date DESC;
            `, [postid, userid, type]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting post data');
        }
    }
};

module.exports = { postsController };
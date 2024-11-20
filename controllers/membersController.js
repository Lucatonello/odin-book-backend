const db = require('../db/pool');

const membersController = {
    getUserData: async (req, res) => {
        let { id, type } = req.params;


        try {
            const result = await db.query(`
                    SELECT u.*, 
                        COUNT(DISTINCT CASE WHEN f.receivertype = 'user' THEN f.id END) AS followers_count, 
                        COUNT(DISTINCT CASE
                            WHEN c.receiverid = u.id AND c.status = 'accepted' THEN c.giverid
                            WHEN c.giverid = u.id AND c.status = 'accepted' THEN c.receiverid
                        END) AS connections_count
                    FROM users u
                    LEFT JOIN follows f ON u.id = f.receiverid 
                    LEFT JOIN connections c ON u.id = c.receiverid OR u.id = c.giverid
                    WHERE u.id = $1
                    GROUP BY u.id
            `, [id]);

            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting user data');
        }
    },
    getCompanyData: async (req, res) => {
        let { id, type } = req.params;

        if (!type) {
            return res.status(400).send('Invalid type');
        }

        try {
            const result = await db.query(`
                SELECT c.*, 
                    COUNT(CASE WHEN f.receivertype = 'company' THEN f.id END) AS followers_count
                FROM companies c
                LEFT JOIN follows f ON c.id = f.receiverid AND f.receivertype = 'company'
                WHERE c.id = $1
                GROUP BY c.id, c.name, c.password, c.logo, c.area, c.location, c.website, c.people, c.followerids, c.about
            `, [id]);

            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting company data');
        }
    },
    getMemberActivity: async (req, res) => {
        let { id, type } = req.params;
        //format id column name
        type = type == 'user' ? 'authorid' : type == 'company' ? 'companyid' : null;

        try {
            const posts = await db.query(`
                SELECT * FROM posts
                WHERE ${type} = $1
            `, [id]);
            const comments = await db.query(`
                SELECT * FROM comments
                WHERE ${type} = $1
            `, [id]);

            res.json({ posts: posts.rows, comments: comments.rows });
        } catch (err) {
            console.error(err)
            res.status(500).send('Error receiving activity data');
        }
    },
    getUserExperience: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await db.query(`
                SELECT * 
                FROM experience
                WHERE userid = $1
            `, [id]);

            res.json(result.rows);
        } catch (err) {
            console.error(err)
            res.status(500).send('Error receiving experience data');
        }
    },
    getUserEducation: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await db.query(`
                SELECT *
                FROM education 
                WHERE userid = $1
            `, [id]);

            res.json(result.rows);
        } catch (err) {
            console.error(err)
            res.status(500).send('Error receiving education data');
        }
    },
    getUserSkills: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await db.query(`
                SELECT *
                FROM skills
                WHERE userid = $1
            `, [id]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error receiving skills data');
        }
    },
    updateUserIntro: async (req, res) => {
        const id = req.params.userid;
        const { username, summary, location, website } = req.body;

        let query = 'UPDATE users SET';
        const fields = [];
        const values = [];

        Object.keys(req.body).forEach((key) => {
            fields.push(`${key} = $${fields.length + 1}`);
            values.push(req.body[key]);
        });
        const formatedFields = fields.join(', ')

        try {
            await db.query(`
                ${query}
                ${formatedFields}
                WHERE id = $${fields.length + 1}               
            `, [...values, id]);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating intro')
        }
    },
    updateUserAbout: async (req, res) => {
        const id = req.params.userid;
        const newAbout = req.body.newAbout;

        try {
            await db.query(`
                UPDATE users 
                SET about = $1
                WHERE id = $2
            `, [newAbout, id]);

            res.json({ isDone: true });
        } catch (err) {
            console.erro(err)
            res.status(500).send('Error updating user about')
        }
    },
    updateCompanyAbout: async (req, res) => {
        const companyid = req.params.companyid;
        const newAbout = req.body.newAbout;

        try {
            await db.query(`
                UPDATE companies 
                SET about = $1
                WHERE id = $2
            `, [newAbout, companyid]);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating company about');
        }
    },
    newExperience: async (req, res) => {
        const id = req.params.userid;
        const {
            companyName,
            description,
            employmentType,
            isActive,
            location,
            startMonth,
            startYear,
            endMonth,
            endYear,
            title
        } = req.body;

        const queryTop = 'INSERT INTO experience';
        const fields = [];
        const values = [];

        Object.keys(req.body).forEach((key) => {
            fields.push(key);
            values.push(req.body[key]);
        });

        fields.unshift('userid');
        values.unshift(id);

        values.toString()
        const formatedValues = "'" + values.join("', '") + "'";

        try {
            await db.query(`
                ${queryTop}
                (${fields.toString()})
                VALUES (${formatedValues})
            `);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error inserting experience to the database');
        }
    },
    editExperience: async (req, res) => {
        const { userid, expid } = req.params; 
        const {
            companyName,
            description,
            employmentType,
            isActive,
            location,
            startMonth,
            startYear,
            endMonth,
            endYear,
            title
        } = req.body;

        const querytop = 'UPDATE experience SET'
        const fields = [];
        const values = [];

        Object.keys(req.body).forEach((key) => {
            fields.push(`${key} = $${fields.length + 1}`)
            values.push(req.body[key]);
        });
        const formatedFields = fields.join(', ')
        try {
            await db.query(`
                ${querytop}
                ${formatedFields}
                WHERE id = ${expid}

            `, [...values])

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating experience database');
        }
    },
    deleteExperience: async (req, res) => {
        const expid = req.params.expid;
        try {
            await db.query(`
                DELETE FROM experience
                WHERE id = $1
            `, [expid]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error deleting experience from database');
        }
    },
    newEducation: async (req, res) => {
        const userId = req.params.userId;
        const {
            school,
            degree,
            startMonth,
            startYear,
            endMonth,
            endYear,
            description
        } = req.body;

        const queryTop = 'INSERT INTO education';
        const fields = [];
        const values = [];

        Object.keys(req.body).forEach((key) => {
            fields.push(key);
            values.push(req.body[key]);
        });

        fields.unshift('userid');
        values.unshift(userId);

        values.toString()
        const formatedValues = "'" + values.join("', '") + "'";

        try {
            await db.query(`
                ${queryTop}
                (${fields.toString()})
                VALUES (${formatedValues})
            `);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error inserting education to the database');
        }
    },
    editEducation: async (req, res) => {
        const userid = req.params.userid;
        const educationid = req.params.educationid;

        let {
            school,
            degree,
            description,
            startMonth,
            startYear,
            endMonth,
            endYear
        } = req.body

        const queryTop = 'UPDATE education SET';
        const fields = [];
        const values = [];

        Object.keys(req.body).forEach((key) => {
            fields.push(`${key} = $${fields.length + 1}`);
            values.push(req.body[key]);
        });
        const formatedFields = fields.join(', ')

        try {
            await db.query(`
                ${queryTop}
                ${formatedFields}
                WHERE id = ${educationid}
            `, [...values]);

            res.json({ isDone: true });
        } catch(err) {
            console.error(err);
            res.staus(500).send('Error updating education database');
        }
    },
    deleteEducation: async (req, res) => {
        const educationid = req.params.educationid;

        try {
            await db.query(`
                DELETE FROM education
                WHERE id = $1
            `, [educationid])
        } catch(err) {
            console.error(err);
            res.status(500).send('Error deleting education from database');
        }
    },
    newSkill: async (req, res) => {
        const userid = req.params.userid;
        const skill = req.body.skill;

        try {
            await db.query(`
                INSERT INTO
                skills (userid, skill)
                VALUES ($1, $2)
            `, [userid, skill]);

            res.json({ isDone: true });
        } catch(err) {
            console.error(err);
            res.status(500).send('Error adding skill to database');
        }
    },
    deleteSkill: async (req, res) => {
        const skillid = req.params.skillid;

        try {
            await db.query(`
                DELETE FROM 
                skills
                WHERE id = $1    
            `, [skillid]);

            res.json({ isDone: true });
        } catch(err) {
            console.error(err);
            res.status(500).send('Error deleting skill from database');
        }
    },
    getCompanyJobOpenings: async (req, res) => {
        const id = req.params.id;

        try {
            const result = await db.query(`
                SELECT j.*, COUNT(a.id) AS applicant_count
                FROM jobs j
                LEFT JOIN applicants a ON j.id = a.jobid
                WHERE companyid = $1
                GROUP BY j.id
            `, [id]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error geting jobs data');
        }
    },
    updateCompanyIntro: async (req, res) => {
        const id = req.params.id;
        const {name, location, website} = req.body;

        const queryTop = 'UPDATE companies SET';
        const fields = []
        const values = [];

        Object.keys(req.body).forEach((key) => {
            fields.push(`${key} = $${fields.length + 1}`);
            values.push(req.body[key]);
        });
        const formatedFields = fields.join(', ')

        try {
            await db.query(`
                ${queryTop}
                ${formatedFields}
                WHERE id = $${fields.length + 1}         
            `, [...values, id]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating company intro');
        }
    },
    changeJobStatus: async (req, res) => {
        const id = req.params.id;
        const { status } = req.body;

        try {
            await db.query(`
                UPDATE jobs 
                SET public = $1
                WHERE id = $2
            `, [status, id]);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error changing job status');
        }
    },
    follow: async (req, res) => {
        const { userid, receiverid} = req.params;
        const { userType, type} = req.body;

        try {
            await db.query(`
                INSERT INTO follows
                (giverid, receiverid, givertype, receivertype)
                VALUES ($1, $2, $3, $4)
            `, [userid, receiverid, userType, type]);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding follow');
        }
    },
    checkFollow: async (req, res) => {
        const { userid, memberid, usertype, membertype } = req.params;

        try {
            const resultFollow = await db.query(`
                SELECT *
                FROM follows
                WHERE 
                    (giverid = $1 AND receiverid = $2) OR (giverid = $2 AND receiverid = $1)
                    AND givertype = $3 AND receivertype = $4
            `, [userid, memberid, usertype, membertype]);

            const resultConnection = await db.query(`
                SELECT * 
                FROM connections 
                WHERE 
                    (giverid = $1 AND receiverid = $2)
                OR
                    (giverid = $2 AND receiverid = $1)
            `, [userid, memberid]);

            if (resultFollow.rows.length > 0 && resultConnection.rows.length > 0) {
                res.json({ isFollowing: true, isConnected: true });
            } else if (resultFollow.rows.length > 0) {
                res.json({ isFollowing: true, isConnected: false });
            } else if (resultConnection.rows.length > 0) {
                res.json({ isFollowing: false, isConnected: true });
            } else {
                res.json({ isFollowing: false, isConnected: false });
            }
            
        } catch (err) {
            console.error(err);
            res.status(500).send('Error checking follow status');
        }
    },
    unfollow: async (req, res) => {
        const { userid, receiverid} = req.params;
        const { userType, type} = req.body;

        try {
            await db.query(`
                DELETE FROM follows
                WHERE giverid = $1 AND receiverid = $2 AND givertype = $3 AND receivertype = $4
            `, [userid, receiverid, userType, type]);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro removing follow');
        }
    },
    connect: async (req, res) => {
        const { userid, receiverid} = req.params;
        const { userType, type} = req.body;

        if (userType == 'company' || type == 'company') {
            res.json({ message: 'You can not connect with a company'})
        }

        try {
            const existingRequest = await db.query(`
                SELECT * 
                FROM connections 
                WHERE (giverid = $1 AND receiverid = $2)
                   OR (giverid = $2 AND receiverid = $1);
            `, [userid, receiverid]);

            if (existingRequest.rows.length > 0) {
                res.status(500).send('A request already exists betweem this users')
            }

            await db.query(`
                INSERT INTO connections
                (giverid, receiverid, status)
                VALUES ($1, $2, 'pending')
            `, [userid, receiverid]);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding connection');
        }
    },
    getUserConnections: async (req, res) => {
        const userid = req.params.userid;

        try {
            const result = await db.query(`
                SELECT u.id, u.username, u.summary, u.profilepic
                FROM connections c
                JOIN users u 
                ON  u.id = CASE 
                             WHEN c.giverid = $1 THEN c.receiverid
                             WHEN c.receiverid = $1 THEN c.giverid 
                           END
                WHERE (c.giverid = $1 OR c.receiverid = $1) AND c.status = 'accepted'
            `, [userid]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting connections data');
        }
    },
    removeConnection: async (req, res) => {
        const { userid, connectionid } = req.params;

        try {
            await db.query(`
                DELETE FROM connections
                WHERE (giverid = $1 AND receiverid = $2)
                    OR (giverid = $2 AND receiverid = $1);
            `, [userid, connectionid]);

            res.json({ isDone: true })
        } catch (err) {
            console.error(err);
            res.status(500).send('Error removing connection');
        }
    },
    getAllUsers: async (req, res) => {
        const userid = req.params.userid;

        try {
            const result = await db.query(`
                SELECT u.id, u.location, u.summary, u.username, c.status
                FROM users u
                LEFT JOIN connections c
                    ON (u.id = c.receiverid AND c.giverid = $1)
                    OR (u.id = c.giverid AND c.receiverid = $1)
                 WHERE u.id != $1 AND (c.id IS NULL OR c.status = 'pending')
            `, [userid]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error gettin users data');
        }
    },
    getRequests: async (req, res) => {
        const userid = req.params.userid;
        try {
            const result = await db.query(`
                SELECT c.id, c.status, u.id AS userid, u.username, u.summary
                FROM connections c
                JOIN users u ON c.giverid = u.id
                WHERE c.receiverid = $1 AND c.status = 'pending'
            `, [userid]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting connection requests');
        }
    },
    handleConnectionReq: async (req, res) => {
        const reqid = req.params.reqid;
        const status = req.params.status;

        try {
            await db.query(`
                UPDATE connections
                SET status = $1
                WHERE id = $2
            `, [status, reqid]);

            res.json({ isDone: true });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating connection status');
        }
    },
};

module.exports = { membersController };

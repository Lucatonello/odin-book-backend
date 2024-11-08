const db = require('../db/pool');

const membersController = {
    getUserData: async (req, res) => {
        let { id, type } = req.params;
        type = formatType(type);

        if (!type) {
            return res.status(400).send('Invalid type');
        }

        try {
            const response = await db.query(`
                SELECT t.*, COUNT(f.id) AS followers_count
                FROM ${type} t
                LEFT JOIN follows f ON t.id = f.receiverid 
                WHERE t.id = $1
                GROUP BY t.id
            `, [id]);

            res.json(response.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error receiving data');
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

            res.json({ message: 'updated succesfully' });
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

            res.json({ message: 'About updated succesfully'})
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
        let status = req.body.status;

        status == true ? status = false : status = true;
        try {
            await db.query(`
                UPDATE jobs 
                SET public = $1
                WHERE id = $2
            `, [status, id]);
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
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding follow');
        }
    },
    checkFollow: async (req, res) => {
        const { userid, memberid, usertype, membertype } = req.params;

        try {
            const result = await db.query(`
                SELECT *
                FROM follows
                WHERE giverid = $1 AND receiverid = $2 AND givertype = $3 AND receivertype = $4
            `, [userid, memberid, usertype, membertype]);

            if (result.rows.length > 0) {
                res.json({ isFollowing: true});
            } else {
                res.json({ isFollowing: false});
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
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro removing follow');
        }
    }
};

function formatType(type) {
    type = type == 'user' ? 'users' : type == 'company' ? 'companies' : null;
    return type;
}

module.exports = { membersController };

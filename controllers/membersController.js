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
                SELECT *, 
                COALESCE(array_length(connectionids, 1), 0) AS connections_count,
                COALESCE(array_length(followerids, 1), 0) AS followers_count
                FROM ${type}
                WHERE id = $1
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
        const formatedValues = "'" + values.join("', '") + "'";
        console.log('FIELDS', formatedFields);
        console.log('VALUES', formatedValues);

        try {
            await db.query(`
                ${query}
                ${formatedFields}
                WHERE id = $${fields.length + 1}               
            `, [...values, id]);

            res.json({ message: 'updated succesfully' });
        } catch (err) {
            console.error(err);
        }
    }
};

function formatType(type) {
    type = type == 'user' ? 'users' : type == 'company' ? 'companies' : null;
    return type;
}

module.exports = { membersController };

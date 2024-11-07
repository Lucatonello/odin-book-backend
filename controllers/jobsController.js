const db = require('../db/pool');

const jobsController = {
    getAllJobs: async (req, res) => {
        try {
            const result = await db.query(`
                SELECT
                    c.id AS companyId,
                    c.logo,
                    c.name,
                    j.id,
                    j.title,
                    j.area,
                    j.location,
                    j.jobtype,
                    j.explevel,
                    j.salary,
                    J.description
        
                FROM jobs j
                JOIN companies c ON j.companyid = c.id
        
                WHERE public = true;
            `);
        
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting jobs from database');
        }
    },
    getJobInfo: async (req, res) => {
        const id = req.params.id;
        try {
            const result = await db.query(`
                SELECT j.*, c.name
                FROM jobs j
                JOIN companies c ON j.companyid = c.id
                WHERE j.id = $1
            `, [id]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting job details');
        }
    },
    newJobPost: async (req, res) => {
        const id = req.params.companyid;
        const {
                title,
            area,
            jobType,
            expLevel,
            salary,
            location,
            isPublic,
            description
        } = req.body;

        const queryTop = 'INSERT INTO jobs';
        const fields = [];
        const values = [];

        Object.keys(req.body).forEach((key) => {
            fields.push(key);
            values.push(req.body[key]);
        });

        fields.unshift('companyid');
        values.unshift(id);

        values.toString();
        const formattedValues = "'" + values.join("', '") + "'";

        try {
            await db.query(`
                ${queryTop}
                (${fields.toString()})
                VALUES (${formattedValues})
            `)
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding new job to the database');
        }
    },
    applyToJob: async (req, res) => {
        const {jobid, userid} = req.params;
        const {email, number} = req.body;
        const cv = req.file

        try {
            await db.query(`
                INSERT INTO applicants
                (jobid, userid, email, number, cv)
                VALUES ($1, $2, $3, $4, $5)
            `, [jobid, userid, email, number, cv.filename]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding candidate to the database');
        }
    },
    getJobApplicants: async (req, res) => {
        const jobid = req.params.jobid;

        try {
            const result = await db.query(`
                SELECT 
                    a.*,
                    u.username,
                    u.summary
                FROM applicants a
                JOIN users u ON a.userid = u.id 
                WHERE jobid = $1
            `, [jobid]);

            res.json(result.rows)
        } catch (err) {
            console.error(err);
            res.status(500).send('Error getting job applicants');
        }
    }
}

module.exports = { jobsController };
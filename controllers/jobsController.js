const db = require('../db/pool');

const jobsController = {
    getAllJobs: async (req, res) => {
        try {
            const result = await db.query(`
                SELECT
                    c.id,
                    c.logo,
                    c.name,
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
    }
}

module.exports = { jobsController };
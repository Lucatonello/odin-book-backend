const db = require('../db/pool');

const membersController = {
    getUserData: async (req, res) => {
        let { id, type } = req.params;
        type = type === 'user' ? 'users' : type === 'company' ? 'companies' : null;

        if (!type) {
            return res.status(400).send('Invalid type');
        }

        try {
            const response = await db.query(`
                SELECT * FROM ${type}
                WHERE id = $1
            `, [id]);

            res.json(response.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error receiving data');
        }
    }
};

module.exports = { membersController };

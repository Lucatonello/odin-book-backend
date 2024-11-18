const authQueries = require('../db/authQueries.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer();
const db = require('../db/pool');


//jwt setup
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        
        jwt.verify(bearerToken, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(403).send('Forbidden');
    }
}

const authController = {
    login: async (req, res) => {
        const type = req.body.type;

        if (type === 'user') {
            const { username, password } = req.body;
            try {
                const result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);

                if (result.rows.length === 0) {
                    return res.status(500).json({ message: 'Username does not match' });
                }
                const user = result.rows[0];

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(500).json({ message: 'Password does not match' });
                }

                jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, (err, token) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Error with JWT');
                    }
                    res.json({
                        token,
                        userid: user.id,
                        username
                    });
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error during login' });
            }
        } else if (type === 'company') {
            const { companyName, companyPassword } = req.body;
            try {
                const result = await db.query(`SELECT * FROM companies WHERE name = $1`, [companyName]);

                if (result.rows.length === 0) {
                    return res.status(500).json({ message: 'Name does not match' });
                }
                const company = result.rows[0];

                const isMatch = await bcrypt.compare(companyPassword, company.password);
                if (!isMatch) {
                    return res.status(500).json({ message: 'Password does not match' });
                }

                jwt.sign({ id: company.id, username: company.name }, process.env.JWT_SECRET, (err, token) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Error with JWT');
                    }
                    res.json({
                        token,
                        userid: company.id,
                        username: companyName
                    });
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error during login' });
            }
        }
    },

    signup: [
        upload.none(),
        async (req, res) => {
            const type = req.body.type;

            if (type === 'user') {
                const { username, password, summary, location, website } = req.body;
                const hashedPassword = await bcrypt.hash(password, 10);

                try {
                    await authQueries.signupUser(username, hashedPassword, summary, location, website);
                    res.status(200).json({ message: 'User created' });
                } catch (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Failed to create user' });
                }
            } else if (type === 'company') {
                const { name, password, area, location, summary, website } = req.body;
                const hashedPassword = await bcrypt.hash(password, 10);

                try {
                    await authQueries.signupCompany(name, hashedPassword, area, location, summary, website);
                    res.status(200).json({ message: 'Company created' });
                } catch (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Failed to create company' });
                }
            } else {
                res.status(400).json({ message: 'Type invalid / undefined' });
            }
        }
    ]
};

module.exports = { verifyToken, authController };
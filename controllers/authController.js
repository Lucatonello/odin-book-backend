const authQueries = require('../db/authQueries.js')

exports.login = async (req, res) => {
    try {
        const {}
    }
}

exports.signup = async (req, res) => {
    const type = req.body.type;

    if (type == 'user') {
        const {username, password, summary, location, pfp, website} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await authQueries.signupUser(username, hashedPassword, summary, location, pfp, website);

        } catch (err) {
            console.error(err);
        }
    } else if (type == 'company') {
        const {name, password, logo, area, location, summary, website} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await authQueries.signupCompany(name, password, logo, area, location, summary, website);
        } catch (err) {
            console.error(err);
        }
    } else {
        res.status(500).send('Type invalid / undefined');
    }

}
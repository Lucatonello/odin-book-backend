const authQueries = require('../db/authQueries.js')
const bcrypt = require('bcryptjs')
const multer = require('multer');
const upload = multer();

exports.login = async (req, res) => {
    
}

exports.signup = [
    upload.none(),
    async (req, res) => {
      const type = req.body.type;
  
      if (type === 'user') {
        const { username, password, summary, location, website } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
  
        try {
          await authQueries.signupUser(username, hashedPassword, summary, location, website);
          res.status(200).json({ message: 'user created' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'failed to create user' });
        }
      } else if (type === 'company') {
        const { name, password, area, location, summary, website } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
  
        try {
          await authQueries.signupCompany(name, hashedPassword, area, location, summary, website);
          res.status(200).json({ message: 'company created' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'failed to create company' });
        }
      } else {
        res.status(400).json({ message: 'Type invalid / undefined' });
      }
    }
];
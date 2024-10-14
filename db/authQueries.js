const db = require('db');

exports.signupUser = async (username, hashedPassword, summary, location, pfp, website) => {
    const result = await db.query(`
        INSERT INTO users 
        (username, password, summary, location, profilepic, website)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `, [username, hashedPassword, summary, location, pfp, website]) 
}

exports.signupCompany = async (name, hashedPassword, logo, area, location, summary, website) => {
    const result = await db.query(`
        INSERT INTO companies
        (name, password, logo, area, location, summary, website)
        VALUES ($1, $2, $3, $4, $5, $6, $7)    
    `, [name, hashedPassword, logo, area, location, summary, website])
}
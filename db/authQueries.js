const db = require('./pool');

exports.signupUser = async (username, hashedPassword, summary, location, website) => {
    const result = await db.query(`
        INSERT INTO users 
        (username, password, summary, location, website)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `, [username, hashedPassword, summary, location, website]) 
}

exports.signupCompany = async (name, hashedPassword, area, location, summary, website) => {
    const result = await db.query(`
        INSERT INTO companies
        (name, password, area, location, summary, website)
        VALUES ($1, $2, $3, $4, $5, $6)    
    `, [name, hashedPassword, area, location, summary, website])
}

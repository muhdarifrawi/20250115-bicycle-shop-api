const { createConnection } = require('mysql2/promise');

async function verifyUser(req, res, next) {
    connection = await createConnection({
        "host": process.env.DB_HOST,
        "user": process.env.DB_USER,
        "database": process.env.DB_NAME,
        "password": process.env.DB_PASSWORD,
        "namedPlaceholders": true,
        waitForConnections: true,
        connectionLimit: 10000,
        queueLimit: 0,
    })

    let {username} = req.body;
    
    let [user] = await connection.execute(`SELECT * FROM user WHERE username=?;`, [username]);
    
    if(user.length != 0){
        res.status(200).json({
            user
        });
    }

    let [staff] = await connection.execute(`SELECT * FROM staff WHERE username=?;`, [username]);
    
    if(staff.length != 0){
        res.status(200).json({
            staff
        });
    }

    if(user.length == 0 && staff.length == 0){
        res.status(200).json({
            message: "Username or Password is incorrect"
        });
    }
}

module.exports = { verifyUser };
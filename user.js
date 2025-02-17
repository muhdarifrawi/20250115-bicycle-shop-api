const { createConnection } = require('mysql2/promise');
const { generateAccessToken } = require('./auth');

async function loginUser(req, res, next) {
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

    let { username, password } = req.body;
    console.log(username, password);
    try {
        let [user] = await connection.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        let [staff] = await connection.execute(`SELECT * FROM staff WHERE username=?;`, [username]);
        // console.log(user[0].username, user[0].password)
        // console.log(user[0].password === password);

        if (user.length == 0 && staff.length == 0) {
            return res.status(200).json({
                message: "Username or Password is incorrect [1]"
            });
        }

        else if (user.length != 0)  {
            if (user[0].password !== password) {
                return res.status(401).json({
                    message: "Username or Password is incorrect [2]"
                });
            }
            else {
                let userData = {
                    userId:user[0].user_id,
                    name:user[0].name,
                    username:user[0].username,
                    birthdate:user[0].birthdate,
                    role:"user"
                }

                let accessToken = generateAccessToken(userData);
                res.cookie("sessionId", accessToken);

                return res.status(200).json({
                    userData
                });
            }
        }

        else if (staff.length != 0) {
            if (staff[0].password !== password) {
                return res.status(401).json({
                    message: "Username or Password is incorrect [3]"
                });
            }
            else {
                let staffData = {
                    staffId:staff[0].user_id,
                    name:staff[0].name,
                    username:staff[0].username,
                    joinDate:staff[0].date_joined,
                    title:staff[0].title,
                    role:"staff"
                }

                let accessToken = generateAccessToken(staffData);
                res.cookie("sessionId", accessToken);

                return res.status(200).json({
                    staffData
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function logoutUser(req, res, next) {
    try {
        res.clearCookie("sessionId");
        res.status(200).json({
            message: "You are logged out."
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { loginUser, logoutUser };
const jwt = require('jsonwebtoken');

function generateAccessToken(data) {
    console.log("generating");
    return jwt.sign({data}, process.env.TOKEN_SECRET, { expiresIn: "1h" });
}

function authCheck(req, res, next) {
    const authHeader = req.headers['cookie'];
    // const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split('=')[1];
    
    console.log(req.body);
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
        console.log(err);
        if (err) {
            return res.sendStatus(403);
        }
        console.log(data);
        req.data = data;
        next();
    })
}

module.exports = { generateAccessToken, authCheck };
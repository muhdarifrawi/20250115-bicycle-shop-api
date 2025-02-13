const jwt = require('jsonwebtoken');

function generateAccessToken(username) {
    console.log("generating");
    return jwt.sign({username}, process.env.TOKEN_SECRET, { expiresIn: "1h" });
}

function authCheck(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err);
        if (err) {
            return res.sendStatus(403);
        }
        console.log(user);
        req.user = user;
        next();
    })
}

module.exports = { generateAccessToken, authCheck };
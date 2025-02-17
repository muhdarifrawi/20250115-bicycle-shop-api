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

function adminCheck(req, res, next) {
    try {
        const body = req.data;
        console.log("adminCheck: ", body.data)
        console.log("data role: ", body.data.role)
        if(body.data.role !== "staff"){
            return res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page."
            })
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = { generateAccessToken, authCheck, adminCheck };
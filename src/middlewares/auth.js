const jwt = require('jsonwebtoken');
const { promisify } = require('util');

async function checkAuth(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET);

        if (decoded) {
            req.user = decoded;
            next();
        } else {
            return res.status(401).json({ message: 'Token is invalid' });
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            // Handle expired token here
            return res.status(401).json({ message: 'Token has expired' });
        } else {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = { checkAuth };
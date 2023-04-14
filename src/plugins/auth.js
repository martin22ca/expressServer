const jwt = require('jsonwebtoken');
const { promisify } = require("util")

async function checkAuth(token) {
    try {
        const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET)

        if (decoded) {
            return true
        }
        else return false

    }
    catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {checkAuth}

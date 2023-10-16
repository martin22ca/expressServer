const pool = require('../db.js')
pool.connect();

const getRoles = async (req, res) => {
    try {
        const queryAtt = "select r.id, r.value as title, r.description as subtitle from roles r where r.id != 0 and r.id !=1"
        const rQ = await pool.query(queryAtt)
        var roles = rQ.rows
        
        res.status(200).send({
            roles,
        });
        return null
    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}
module.exports = {getRoles}
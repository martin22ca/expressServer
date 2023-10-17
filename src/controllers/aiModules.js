const fetch = require('node-fetch');

const pool = require('../db.js')
pool.connect();
const getModules = async (req, res) => {
    try {
        const modulesQ = await pool.query('select * from ai_modules am')
        const modules = modulesQ.rows

        res.status(200).send({
            modules
        })
        return null
    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}
const getStatus = async (req, res) => {
    let daemonInstalled = false
    let daemonWorking = false

    try {
        const clientIp = req.connection.remoteAddress
        const queryAtt = "select * from ai_modules am where ip_module = $1"

        const classroomQ = await pool.query(queryAtt, [clientIp])
        if (classroomQ.rowCount != 0) {
            daemonInstalled = true

            const url = "http://" + clientIp + ":3023/hello";
            try {
                const fetchedData = await fetch(url);

                if (fetchedData.status == 200) {
                    daemonWorking = true
                }
            } catch (error) {
                console.log("Not online")
            }

        }
        res.status(200).send({
            "daemonInstalled": daemonInstalled,
            "daemonWorking": daemonWorking,
        })
        return null


    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            "daemonInstalled": daemonInstalled,
            "daemonWorking": daemonWorking,
            'message': 'Server Error'
        })
    }
}


module.exports = { getModules, getStatus }
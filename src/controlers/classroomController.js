const { checkAuth } = require("../plugins/auth")
const fetch = require('node-fetch');

const pool = require('../db')
pool.connect();

const checkIp = async (req, res) => {
    let daemonInstalled = false
    let daemonWorking = false
    try {

        const { accessToken } = req.query;
        const clientIp = req.connection.remoteAddress

        if (!accessToken) {
            res.status(403).send({
                'message': 'No Token'
            });
            return null
        }
        if (!await checkAuth(accessToken)) {
            res.status(403).send({
                'message': 'Not Valid Token'
            });
            return null
        }
        const queryAtt = "select * from classrooms c where c.ip_classroom = $1"

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

const getClassrooms = async (req, res) => {
    try {

        const { accessToken } = req.query;
        const clientIp = req.connection.remoteAddress

        if (!accessToken) {
            res.status(403).send({
                'message': 'No Token'
            });
            return null
        }
        if (!await checkAuth(accessToken)) {
            res.status(403).send({
                'message': 'Not Valid Token'
            });
            return null
        }
        const queryAtt = "select * from classrooms c where ip_classroom != $1"

        const classroomQ = await pool.query(queryAtt, [clientIp])
        const classrooms = classroomQ.rows

        res.status(200).send({
            "classrooms": classrooms
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

module.exports = { checkIp,getClassrooms }
const fetch = require('node-fetch');

const pool = require('../db.js')
pool.connect();

const checkIp = async (req, res) => {
    let daemonInstalled = false
    let daemonWorking = false
    try {
        const clientIp = req.connection.remoteAddress

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

        const queryAtt = 'select * ,am.id as "id_module" from ai_modules am'
        const classroomQ = await pool.query(queryAtt, [])
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

const setClass = async (req, res) => {
    try {

        const {idClass, idClassroom } = req.body;

        const queryClass = 'update classrooms set  id_default_class = $1 where id = $2'

        const classroomQ = await pool.query(queryClass, [idClass,idClassroom])

        res.status(200).send({
            "classrooms": 'ok'
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

module.exports = { checkIp,getClassrooms,setClass }
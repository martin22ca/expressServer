const pool = require('../db.js')
pool.connect();

const getMsgs = async (req, res, next) => {
    try {
        const { idUser } = req.query;

        const foundMessages = await pool.query("SELECT m.id,m.title, m.message, um.viewd, m.info FROM messages m inner join users_messages um on m.id = um.id_message inner join users u on um.id_user = u.id where u.id = $1 order by viewd ",
            [idUser], async (error, results) => {
                const messages = results.rows
                res.status(200).send({
                    messages
                });

            })
    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}

const viewdMsg = async (req, res, next) => {
    try {
        const { idMessage, idUser } = req.query;

        const foundMessages = await pool.query("update users_messages um set viewd = true where um.id_user = $1 and um.id_message = $2",
            [idUser, idMessage], async (error, results) => {
                if (results.rowCount == 1)
                    res.status(200).send({
                        "message": "message is now viewd"
                    });
            })
    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}

const deleteMsg = async (req, res, next) => {
    try {
        const { idMessage, idUser } = req.query;

        const result = await pool.query(
            'SELECT COUNT(*) FROM public.users_messages WHERE id_message = $1 AND id_user != $2',
            [idMessage, idUser]
        );

        const otherUsersHaveMessage = parseInt(result.rows[0].count) > 0;

        if (otherUsersHaveMessage) {
            const delIntermediary = await pool.query(
                'DELETE FROM public.users_messages WHERE id_user = $1 AND id_message = $2',
                [idUser, idMessage]
            );
        } else {
            const delIntermediary = await pool.query(
                'DELETE FROM public.users_messages WHERE id_user = $1 AND id_message = $2',
                [idUser, idMessage]
            );
            const lastMsg = await pool.query('DELETE FROM public.messages WHERE id = $1', [idMessage]);
        }
        res.status(200).send({
            'message': 'msg deleted'
        })
    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}

module.exports = { getMsgs, viewdMsg, deleteMsg }
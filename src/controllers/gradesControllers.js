const pool = require('../db.js')
pool.connect();

const getGrades = async (req, res) => {
    try {
        const gradesQ = await pool.query("SELECT g.id AS id_grade, school_year,school_section, STRING_AGG(CONCAT(pd.first_name, ' ', pd.last_name), ',  ') AS users " +
            "FROM grade g " +
            "LEFT JOIN users_grades ug ON ug.id_grade = g.id " +
            "LEFT JOIN users u ON ug.id_user = u.id " +
            "LEFT JOIN personal_data pd ON u.id_personal = pd.id " +
            "GROUP BY g.id, school_year, school_section " +
            "ORDER BY school_year ASC; ")

        var grades = gradesQ.rows
        res.status(200).send({
            grades
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

const homeClasses = async (req, res) => {
    try {
        const { idUser } = req.query;

        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        const currentDate = `${day}-${month}-${year}`

        const queryAtt = "select g.id from  grade g inner join users_grades ug ON g.id = ug.id_grade where ug.id_user = $1 " +
            "and g.id not in (select id_grade from roll_call rc where att_date = $2)"

        const rollCallQ = await pool.query(queryAtt, [idUser, currentDate])
        const rollCalls = rollCallQ.rows

        for (const roll of rollCalls) {
            await pool.query("insert into roll_call (id_grade,att_date) values ($1,$2)", [roll.id, currentDate])
        }
        const gradesQ = await pool.query("select * from roll_call rc inner join grade g ON rc.id_grade = g.id inner join users_grades ug ON g.id = ug.id_grade " +
            "where ug.id_user =$1 and rc.att_date =$2 order by rc.status", [idUser, currentDate])

        res.status(200).send({
            "grades": gradesQ.rows
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

const gradesUser = async (req, res) => {
    try {
        const { idUser } = req.query;

        let queryAtt = `select *,concat(school_year,' "',school_section,'"') as title from grade g inner join users_grades ug ON ug.id_grade = g.id where ug.id_user = $1 order by school_year asc `
        if (idUser <= 1) {
            queryAtt = `select *,concat(school_year,' "',school_section,'"') as title, $1 from grade order by school_year asc`
        }
        const gradesQ = await pool.query(queryAtt, [idUser])
        const grades = gradesQ.rows

        res.status(200).send({
            grades
        });
        return null
        student_class

    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}
const registerGrade = async (req, res) => {
    try {
        const { year, section, idUsers } = req.body;

        const checkForClass = await pool.query("select * from grade where school_year = $1 and school_section = $2", [year, section])
        if (checkForClass.rowCount > 0) return res.status(400).json({ 'message': 'Curso ' + year + ' "' + section + '" ya existe.' });

        const newGrade = await pool.query("insert into grade (school_year,school_section) values ($1,$2) RETURNING ID", [year, section])
        const idGrade = newGrade.rows[0].id

        for (const idUser of idUsers) {
            await pool.query("insert into users_grades (id_user,id_grade) values ($1,$2)", [idUser, idGrade])
        }
        return res.status(200).json({ 'message': 'Creada nueva Clase con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database creation.' });
    }
}

const removeGrade = async (req, res) => {
    try {
        const { idGrade } = req.query;
        const removeClass = await pool.query("delete from grade where id =$1", [idGrade])
        return res.status(200).json({ 'message': 'Creada nueva Clase con exito!' });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}
const updateGrade = async (req, res) => {
    try {
        const { idGrade, year, section, idUsers } = req.body;
        // Fetch the current users associated with the grade
        const currentUsers = await pool.query("SELECT id_user FROM users_grades WHERE id_grade = $1", [idGrade]);
        const currentUsersArray = currentUsers.rows.map(row => row.id_user);

        // Determine users to add and users to remove
        const usersToAdd = idUsers.filter(idUser => !currentUsersArray.includes(idUser));
        const usersToRemove = currentUsersArray.filter(idUser => !idUsers.includes(idUser));

        // Add new users
        for (const idUser of usersToAdd) {
            await pool.query("INSERT INTO users_grades (id_grade, id_user) VALUES ($1, $2)", [idGrade, idUser]);
        }

        // Remove old users
        for (const idUser of usersToRemove) {
            await pool.query("DELETE FROM users_grades WHERE id_grade = $1 AND id_user = $2", [idGrade, idUser]);
        }

        await pool.query("update grade set school_year = $1, school_section  = $2 where id = $3", [year, section, idGrade])
        return res.status(200).json({ 'message': 'Actualizado Curso con exito!' });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}

const gradeInfo = async (req, res) => {
    try {
        const { idGrade } = req.query;

        const queryAtt = "select pd.dni,pd.first_name,pd.last_name,sum(case a.present when true then 1 else 0 end) as present, sum(case a.late when true then 1 else 0 end) as late,  count(a.id) as total " +
            "from students s inner join personal_data pd ON s.id_personal = pd.id " +
            "inner join recognition r on pd.id_recog = r.id " +
            "inner join attendances a on a.id_recog = r.id " +
            "where s.id_grade  = $1 group by pd.id "

        const gradeInfoQ = await pool.query(queryAtt, [idGrade])
        const gradeInfo = gradeInfoQ.rows

        res.status(200).send({
            gradeInfo,
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
const gradePrecept = async (req, res) => {
    try {
        const { idGrade } = req.query;

        const gradeUsersQ = await pool.query("select id_user from users_grades ug  where  id_grade = $1", [idGrade])
        const gradeUsers = gradeUsersQ.rows

        res.status(200).send({
            "gradeUsers": gradeUsers,
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


module.exports = { getGrades, homeClasses, gradesUser, gradeInfo, registerGrade, removeGrade, updateGrade, gradePrecept }
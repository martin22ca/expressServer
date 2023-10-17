const pool = require('../db.js')
pool.connect();

const getGrades = async (req, res) => {
    try {
        const gradesQ = await pool.query("select g.id as id_grade,u.id as id_user, school_year,school_section,concat(pd.first_name,' ',pd.last_name) as user from grade g " +
            "left join users u ON g.id_user = u.id " +
            "left  join personal_data pd on u.id_personal = pd.id " +
            "order by school_year asc")
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
        const { userId } = req.query;

        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        const currentDate = `${day}-${month}-${year}`

        const queryAtt = "SELECT sc.id as sc,sc.school_year,sc.school_section ,sum(case a.present when true then 1 else 0 end) as present,count(s.id) as total " +
            "FROM student_class sc left join students s on s.id_student_class = sc.id " +
            "left join attendances a on a.id_student = s.id and a.att_date  = $1 " +
            "where sc.id_employee = $2 group by sc.id ORDER BY school_year desc"

        const foundClasses = await pool.query(queryAtt, [currentDate, userId,])
        var schoolClasses = foundClasses.rows

        res.status(200).send({
            schoolClasses
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

        let queryAtt = `select *,concat(school_year,' "',school_section,'"') as title  from grade where id_user =$1`
        if (idUser <= 1) {
            queryAtt = `select *,concat(school_year,' "',school_section,'"') as title, $1 from grade`
        }
        const gradesQ = await pool.query(queryAtt, [idUser])
        const grades = gradesQ.rows

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
const registerGrade = async (req, res) => {
    try {
        const date = new Date();
        const dateDay = date.getDate();
        const dateMonth = date.getMonth() + 1;
        const dateYear = date.getFullYear();
        const currentDate = `${dateDay}-${dateMonth}-${dateYear}`

        const { year, section, idUser } = req.body;

        const checkForClass = await pool.query("select * from grade where school_year = $1 and school_section = $2", [year, section])
        if (checkForClass.rowCount > 0) return res.status(400).json({ 'message': 'Curso ' + year + ' "' + section + '" ya existe.' });

        var query = "insert into grade (school_year,school_section,closed_date) values ($1,$2,$3)"
        var eleme = [year, section, currentDate]

        if (idUser != null) {
            console.log(idUser)
            query = "insert into grade (school_year,school_section,closed_date,id_user) values ($1,$2,$3,$4)"
            eleme.push(idUser)
        }
        const createClass = await pool.query(query, eleme)
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
        const { idGrade, year, section, idUser } = req.body;
        console.log(req.body)

        const updateClass = await pool.query("update grade set school_year = $1, school_section  = $2, id_user = $3 where id = $4", [year, section, idUser, idGrade])
        return res.status(200).json({ 'message': 'Actualizado Curso con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}

const classInfo = async (req, res) => {
    try {
        const { classId } = req.query;

        const queryAtt = "select dt.id_stud,pd.dni,pd.first_name ,pd.last_name,present,missing,late,total " +
            "from personal_data pd inner join (SELECT s.id as id_stud ,s.id_personal as id_pd,sum(case a.present when true then 1 else 0 end) as present ,sum(case a.present when true then 0 else 1 end) as missing ,sum(case a.late when true then 1 else 0 end) as late,  count(a.id) as total " +
            "FROM students s " +
            "inner join student_class sc on s.id_student_class = sc.id " +
            "left join attendances a on a.id_student = s.id " +
            "where sc.id = $1 " +
            "group by s.id )dt on pd.id = dt.id_pd"

        const classInfoQ = await pool.query(queryAtt, [classId])

        var classInfo = classInfoQ.rows

        res.status(200).send({
            classInfo,
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


module.exports = { getGrades, homeClasses, gradesUser, classInfo, registerGrade, removeGrade, updateGrade }
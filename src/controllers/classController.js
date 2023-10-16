const { checkAuth } = require("../middlewares/auth.js")

const pool = require('../db')
pool.connect();

const homeClasses = async (req, res) => {
    try {
        const { accessToken, userId } = req.query;

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
const getClasses = async (req, res) => {
    try {
        const { accessToken } = req.query;

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

        const schoolClassesQ = await pool.query("select id as id_sc, school_year ,school_section,status from student_class sc order by school_year asc")
        var schoolClasses = schoolClassesQ.rows

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

const getClassesClassroom = async (req, res) => {
    try {
        const { accessToken } = req.query;

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

        const schoolClassesQ = await pool.query("SELECT * FROM student_class sc  WHERE id NOT IN (select id_default_class from classrooms c where id_default_class notnull);")
        var schoolClasses = schoolClassesQ.rows

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

const getClassesByEmp = async (req, res) => {
    try {
        const { accessToken, userId } = req.query;

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
        let queryAtt = 'select id as sc, school_year ,school_section,status from student_class sc where id_employee =$1'
        if (userId == 0) {
            queryAtt = "select id as sc, school_year ,school_section,status,$1 from student_class sc"
        }
        const schoolClassesQ = await pool.query(queryAtt, [userId])
        const schoolClasses = schoolClassesQ.rows

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

const getClassesPerso = async (req, res) => {
    try {
        const { accessToken } = req.query;

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
        const queryAtt = "select sc.id as id_cls, e.id as id_emp,sc.school_year ,sc.school_section,pd.first_name,pd.last_name  from student_class sc left join employees e on sc.id_employee = e.id  left join personal_data pd on pd.id = e.id_personal order by sc.school_year desc"

        const schoolClassesQ = await pool.query(queryAtt)
        var schoolClasses = schoolClassesQ.rows

        for (classA in schoolClasses) {
            if (schoolClasses[classA].first_name != null) {
                schoolClasses[classA]["preceptor"] = schoolClasses[classA].first_name + " " + schoolClasses[classA].last_name
            }
            else {
                schoolClasses[classA]["preceptor"] = null
            }
        }
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

const registerClass = async (req, res) => {
    try {
        const date = new Date();
        const dateDay = date.getDate();
        const dateMonth = date.getMonth() + 1;
        const dateYear = date.getFullYear();
        const currentDate = `${dateDay}-${dateMonth}-${dateYear}`

        const { year, section, id_emp, accessToken } = req.body;

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

        const checkForClass = await pool.query("select * from student_class sc where sc.school_year = $1 and sc.school_section = $2", [year, section])
        if (checkForClass.rowCount > 0) return res.status(200).json({ 'message': 'Clase ' + year + ' "' + section + '" ya existe.' });

        var query = "insert into student_class (school_year,school_section,close_date) values ($1,$2,$3)"
        var eleme = [year, section, currentDate]

        if (id_emp != null) {
            query = "insert into student_class (school_year,school_section,close_date,id_employee) values ($1,$2,$3,$4)"
            eleme.push(id_emp)
        }
        const createClass = await pool.query(query, eleme)
        return res.status(200).json({ 'message': 'Creada nueva Clase con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database creation.' });
    }
}

const removeClass = async (req, res) => {
    try {
        const { accessToken, idClass } = req.query;

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

        const removeClass = await pool.query("delete from student_class where id =$1", [idClass])
        return res.status(200).json({ 'message': 'Creada nueva Clase con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}
const updateClass = async (req, res) => {
    try {
        const { accessToken, idClass, year, section, id_emp } = req.query;

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

        const updateClass = await pool.query("update student_class set school_year = $1, school_section  = $2, id_employee = $3 where id = $4", [year, section, id_emp, idClass])
        return res.status(200).json({ 'message': 'Actualizada Clase con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}

const classInfo = async (req, res) => {
    try {
        const { accessToken, classId } = req.query;

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


module.exports = { homeClasses, getClasses, getClassesByEmp, classInfo, registerClass, getClassesPerso, removeClass, updateClass, getClassesClassroom }
const { Router } = require('express');
const router = Router();

const { hom } = require('../controllers/index.controllers')
const { checkIp, getClassrooms,setClass } = require("../controllers/modules")
const { homeClasses, getClasses, getClassesByEmp, classInfo, registerClass, getClassesPerso, getClassesClassroom, removeClass, updateClass} = require('../controllers/classController')
const { viewAttendaceToday, editAttendance,delAttendance} = require("../controllers/attendeceController")
const { getStudents, registerStudent, updateStudent, removeStudent, setUpAi, removeAi,clean } = require("../controllers/studentsController")

//STUDENT
router.get('/students', getStudents)
router.put('/students/remove', removeStudent)
router.put('/students/update', updateStudent)
router.put('/students/clean', clean)
router.post('/students/register', registerStudent)
router.put('/students/removeAi', removeAi)
router.post('/students/ai', setUpAi)

//CLASSROOM
router.get('/classroom', getClassrooms)
router.get('/classroom/daemon', checkIp) 
router.put('/classroom/class', setClass)

//ATTENDECE
router.get('/attendance', viewAttendaceToday)
router.put('/attendance/update', editAttendance) 
router.put('/attendance/remove', delAttendance)

//CLASS
router.get('/classes', getClasses) 
router.get('/classes/classroom', getClassesClassroom) 
router.get('/classes/employee', getClassesByEmp)
router.get('/classes/info', classInfo)
router.get('/classes/home', homeClasses)
router.get('/classes/person', getClassesPerso)
router.put('/classes/remove', removeClass)
router.put('/classes/update', updateClass)
router.post('/classes/register', registerClass)

router.get('/', hom)

module.exports = router;
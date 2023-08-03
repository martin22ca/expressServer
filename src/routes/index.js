const { Router } = require('express');
const router = Router();

const { hom } = require('../controlers/index.controllers')
const { login, Register, isAuth } = require("../controlers/authControllers")
const { getEmployees, getPrecept,removeEmployee, updateEmployee } = require("../controlers/employeeController")
const { checkIp, getClassrooms,setClass } = require("../controlers/classroomController")
const { homeClasses, getClasses, getClassesByEmp, classInfo, registerClass, getClassesPerso, getClassesClassroom, removeClass, updateClass} = require('../controlers/classController')
const { viewAttendaceToday, editAttendance,delAttendance} = require("../controlers/attendeceController")
const { getMessages, changeViewd, deleteMessage } = require("../controlers/messagesController")
const { getStudents, registerStudent, updateStudent, removeStudent, setUpAi, removeAi,clean } = require("../controlers/studentsController")

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

//EMPLOYEES
router.get('/employees', getEmployees)
router.get('/employees/precept', getPrecept)
router.put('/employees/remove', removeEmployee)
router.put('/employees/update', updateEmployee)


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

//AUTH
router.get('/auth', isAuth)
router.post('/register', Register)
router.post('/login', login)

router.get('/', hom)

//MESSAGE
router.put('/messages/viewd', changeViewd)
router.put('/messages/remove', deleteMessage)
router.get('/messages', getMessages)

module.exports = router;
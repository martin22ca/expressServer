const { Router } = require('express');
const router = Router();

const { hom } = require('../controlers/index.controllers')
const { login, Register, isAuth } = require("../controlers/authControllers")
const { getEmployees, removeEmployee, updateEmployee } = require("../controlers/employeeController")
const { checkIp, getClassrooms } = require("../controlers/classroomController")
const { homeClasses, getClasses, getClassesByEmp, classInfo, registerClass, getClassesPerso, removeClass, updateClass } = require('../controlers/classController')
const { viewAttendeceToday, editAttendance } = require("../controlers/attendeceController")
const { getMessages, changeViewd, deleteMessage } = require("../controlers/messagesController")
const { getStudents, registerStudent, updateStudent, removeStudent, setUpAi, clean } = require("../controlers/studentsController")

//STUDENT
router.get('/students', getStudents)
router.put('/students/remove', removeStudent)
router.put('/students/update', updateStudent)
router.put('/students/clean', clean)
router.post('/students/register', registerStudent)
router.post('/students/ai', setUpAi)

//CLASSROOM
router.get('/classroom', getClassrooms)
router.get('/classroom/daemon', checkIp)

//EMPLOYEES
router.get('/employees', getEmployees)
router.put('/employees/remove', removeEmployee)
router.put('/employees/update', updateEmployee)


//ATTENDECE
router.get('/attendence', viewAttendeceToday)
router.put('/attendence/edit', editAttendance)

//CLASS
router.get('/classes', getClasses)
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
router.put('/messages/delete', deleteMessage)
router.get('/messages', getMessages)

module.exports = router;
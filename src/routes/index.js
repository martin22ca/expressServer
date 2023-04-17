const { Router } = require('express');
const router = Router();

const {homeClasses,getClasses,classInfo} = require('../controlers/classController')
const {hom} =require('../controlers/index.controllers')
const {login,Register,isAuth} = require("../controlers/authControllers")
const {getMessages,changeViewd,deleteMessage} = require("../controlers/messagesController")
const {viewAttendeceToday,editAttendance} = require("../controlers/attendeceController")

//ATTENDECE
router.get('/attendence',viewAttendeceToday)
router.put('/attendence/edit',editAttendance)

//CLASS
router.get('/classes',getClasses)
router.get('/classes/info',classInfo)
router.get('/classes/home',homeClasses)

//AUTH
router.get('/auth',isAuth)
router.post('/register',Register)
router.post('/login',login)

router.get('/',hom)

//MESSAGE
router.put('/messages/viewd',changeViewd)
router.put('/messages/delete',deleteMessage)
router.get('/messages',getMessages)

module.exports = router;
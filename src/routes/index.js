const { Router } = require('express');
const router = Router();

const {getClasses} = require('../controlers/classController')

const {hom} =require('../controlers/index.controllers')

const {login,Register,isAuth} = require("../controlers/authControllers")

const {getMessages,changeViewd,deleteMessage} = require("../controlers/messagesController")

const {viewAttendeceToday} = require("../controlers/attendeceController")

router.get('/attendence',viewAttendeceToday)

router.get('/classes',getClasses)

//GET
router.get('/auth',isAuth)
router.post('/register',Register)
router.post('/login',login)


router.get('/',hom)

router.put('/messages/viewd',changeViewd)
router.put('/messages/delete',deleteMessage)
router.get('/messages',getMessages)
/*
//UPDATE
router.post('/attendence',post_attendence)
*/

module.exports = router;
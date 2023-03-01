const { Router } = require('express');
const router = Router();

const {getClasses} = require('../controlers/classController')

const {hom} =require('../controlers/index.controllers')

const {login,Register,isAuth} = require("../controlers/authControllers")

//GET
router.get('/auth',isAuth)
router.get('/classes',getClasses)
router.get('/',hom)

//router.get('/attendences', get_attendences)
router.post('/login',login)
router.post('/register',Register)
/*

//UPDATE
router.post('/attendence',post_attendence)
*/

module.exports = router;
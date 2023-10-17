const { Router } = require('express');
const router = Router();

const { hom } = require('../controllers/index.controllers')
const { viewAttendaceToday, editAttendance,delAttendance} = require("../controllers/attendeceController")


//ATTENDECE
router.get('/attendance', viewAttendaceToday)
router.put('/attendance/update', editAttendance) 
router.put('/attendance/remove', delAttendance)

router.get('/', hom)

module.exports = router;
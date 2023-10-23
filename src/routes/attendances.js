const { Router } = require('express');
const attendanceRouter = Router();

const { viewAttendaceToday, updateAttendance, closeAttendance } = require("../controllers/attendeceController");
const { checkAuth } = require('../middlewares/auth');

//AUTH
attendanceRouter.get('/', checkAuth, viewAttendaceToday)
attendanceRouter.put('/update', checkAuth, updateAttendance)
attendanceRouter.put('/close', checkAuth, closeAttendance)

const baseUrl = '/attendances';
const router = Router();

router.use(baseUrl, attendanceRouter);
module.exports = router;
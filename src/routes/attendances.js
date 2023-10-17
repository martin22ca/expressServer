const { Router } = require('express');
const attendanceRouter = Router();

const { viewAttendaceToday, updateAttendance, delAttendance} = require("../controllers/attendeceController");
const { checkAuth } = require('../middlewares/auth');

//AUTH
attendanceRouter.get('/',checkAuth, viewAttendaceToday)
attendanceRouter.put('/update',checkAuth, updateAttendance)

const baseUrl = '/attendances';
const router = Router();

router.use(baseUrl, attendanceRouter);
module.exports = router;
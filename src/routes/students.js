
const { Router } = require('express');
const studentRouter = Router();

const { checkAuth } = require('../middlewares/auth');
const { getStudents, registerStudent, updateStudent, removeStudent, removeAi } = require("../controllers/studentsController");


//STUDENT
studentRouter.get('/', checkAuth, getStudents)
studentRouter.put('/remove', checkAuth, removeStudent)
studentRouter.put('/update', checkAuth, updateStudent)
studentRouter.post('/register', checkAuth, registerStudent)
studentRouter.delete('/removeAi', checkAuth, removeAi)

const baseUrl = '/students';
const router = Router();

router.use(baseUrl, studentRouter);
module.exports = router;
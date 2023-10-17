
const { Router } = require('express');
const studentRouter = Router();

const { checkAuth } = require('../middlewares/auth');
const { getStudents, registerStudent, updateStudent, removeStudent, setUpAi, removeAi, clean } = require("../controllers/studentsController");


//STUDENT
studentRouter.get('/', checkAuth, getStudents)
studentRouter.put('/remove', checkAuth, removeStudent)
studentRouter.put('/update', checkAuth, updateStudent)
studentRouter.put('/clean', checkAuth, clean)
studentRouter.post('/register', checkAuth, registerStudent)
studentRouter.put('/removeAi', checkAuth, removeAi)
studentRouter.post('/ai', checkAuth, setUpAi)

const baseUrl = '/students';
const router = Router();

router.use(baseUrl, studentRouter);
module.exports = router;
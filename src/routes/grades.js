const { Router } = require('express');
const gradesRouter = Router();

const { checkAuth } = require("../middlewares/auth")
const { getGrades, homeClasses, gradesUser, gradeInfo, registerGrade, removeGrade, updateGrade } = require('../controllers/gradesControllers')


gradesRouter.get('/', checkAuth, getGrades)
gradesRouter.post('/register', checkAuth, registerGrade)
gradesRouter.put('/remove', checkAuth, removeGrade)
gradesRouter.put('/update', checkAuth, updateGrade)
gradesRouter.get('/user', checkAuth, gradesUser)

gradesRouter.get('/info', checkAuth, gradeInfo)
gradesRouter.get('/home', checkAuth, homeClasses)


const baseUrl = '/grades';
const router = Router();

router.use(baseUrl, gradesRouter);
module.exports = router;
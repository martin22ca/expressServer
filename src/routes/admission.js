const { Router } = require('express');
const admissionRouter = Router();

const { login, isAuth } = require("../controllers/admissionControllers")

//AUTH
admissionRouter.get('/auth', isAuth)
admissionRouter.post('/login', login)

const baseUrl = '/admission';
const router = Router();

router.use(baseUrl, admissionRouter);
module.exports = router;
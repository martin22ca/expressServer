const { Router } = require('express');
const modulesRouter = Router();

const { checkAuth } = require("../middlewares/auth")
const { getModules, getStatus } = require("../controllers/modulesControllers")

//MESSAGE
modulesRouter.get('/', checkAuth, getModules)
modulesRouter.get('/status', checkAuth, getStatus)

const baseUrl = '/modules';
const router = Router();

router.use(baseUrl, modulesRouter);
module.exports = router;
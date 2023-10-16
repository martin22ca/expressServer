const { Router } = require('express');
const rolesRouter = Router();

const { checkAuth } = require("../middlewares/auth")
const { getRoles } = require("../controllers/roles")

//MESSAGE
rolesRouter.get('/', checkAuth, getRoles)

const baseUrl = '/roles';
const router = Router();

router.use(baseUrl, rolesRouter);
module.exports = router;
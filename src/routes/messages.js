const { Router } = require('express');
const messagesRouter = Router();

const { checkAuth } = require("../middlewares/auth")
const { getMsgs, viewdMsg, deleteMsg } = require("../controllers/messagesControllers")

//MESSAGE
messagesRouter.put('/viewd', checkAuth, viewdMsg)
messagesRouter.put('/remove', checkAuth, deleteMsg)
messagesRouter.get('/', checkAuth, getMsgs)

const baseUrl = '/messages';
const router = Router();

router.use(baseUrl, messagesRouter);
module.exports = router;
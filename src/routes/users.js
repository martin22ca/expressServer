const { Router } = require('express');
const userRouter = Router();

const { checkAuth } = require("../middlewares/auth")
const { getUsers, chageStateUser, registerUser, getPrecept, removeUser, updateUser } = require("../controllers/users")

userRouter.get('/', checkAuth, getUsers)
userRouter.get('/precept', checkAuth, getPrecept)
userRouter.post('/register', checkAuth, registerUser)
userRouter.delete('/remove', checkAuth, removeUser)
userRouter.put('/update', checkAuth, updateUser)
userRouter.put('/state', checkAuth, chageStateUser)

const baseUrl = '/users';
const router = Router();

router.use(baseUrl, userRouter);
module.exports = router;
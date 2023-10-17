const { Router } = require('express');
const userRouter = Router();

const { checkAuth } = require("../middlewares/auth")
const { getUsers,getUserRole, chageStateUser, registerUser, removeUser, updateUser } = require("../controllers/users")

userRouter.get('/', checkAuth, getUsers)
userRouter.get('/role', checkAuth, getUserRole)
userRouter.get('/precept', checkAuth, getUserRole)
userRouter.post('/register', checkAuth, registerUser)
userRouter.delete('/remove', checkAuth, removeUser)
userRouter.put('/update', checkAuth, updateUser)
userRouter.put('/state', checkAuth, chageStateUser)

const baseUrl = '/users';
const router = Router();

router.use(baseUrl, userRouter);
module.exports = router;
const { Router } = require('express');
const router = Router();

const { hom } = require('../controllers/index.controllers')

router.get('/', hom)

module.exports = router;
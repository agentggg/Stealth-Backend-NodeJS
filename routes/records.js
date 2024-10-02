var express = require('express');
var router = express.Router();
const userController = require('../controllers/recordManagement');

router.post('/add', userController.add);

module.exports = router;
var express = require('express');
var router = express.Router();
const userController = require('../controllers/accountManagement');

router.put('/create_account', userController.createUser);
router.post('/login', userController.login);
router.post('/reset', userController.passwordReset);

module.exports = router;

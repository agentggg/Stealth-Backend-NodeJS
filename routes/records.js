var express = require('express');
var router = express.Router();
const userController = require('../controllers/recordManagement');

router.post('/add', userController.add);
router.get('/analytics', userController.analytics)
router.post('/set_history', userController.set_history)


module.exports = router;
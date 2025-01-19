var express = require('express');
var router = express.Router();
const automationController = require('../controllers/automation');

router.get('/weekly_reports', automationController.weekly_report);


module.exports = router; 
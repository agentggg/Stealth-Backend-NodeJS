var express = require('express');
var router = express.Router();
const automationController = require('../controllers/automation');

router.get('/weekly_reports', automationController.weekly_report);
router.post('/weekly_reports/test', automationController.weekly_report_test);
router.post('/yesterday_report', automationController.yesterday_report);
router.post('/today_report', automationController.today_report);


module.exports = router; 

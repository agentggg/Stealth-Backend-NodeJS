var express = require('express');
var router = express.Router();
const maintenanceController = require('../controllers/maintenanceManagement');

router.delete('/delete/database/user_workouts/:username', maintenanceController.user_workouts);


module.exports = router;
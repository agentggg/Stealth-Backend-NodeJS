var express = require('express');
var router = express.Router();
const workoutManagementController = require('../controllers/workoutManagement');

router.route('/exercise_management/:username/:day').get(workoutManagementController.getExercises);      // Handles GET requests without ID
router.route('/exercise_management/:id/:username/:day').put(workoutManagementController.updateExercise)     // Handles PUT requests with ID
router.route('/exercise_management/day/:username/:selectDay').get(workoutManagementController.getDays)
router.route('/exercise_management/day/:username').post(workoutManagementController.createDays)
router.route('/exercise_management/update').post(workoutManagementController.saveDayTitle)

module.exports = router;

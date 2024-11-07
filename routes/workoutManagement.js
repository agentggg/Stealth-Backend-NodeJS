var express = require('express');
var router = express.Router();
const workoutManagementController = require('../controllers/workoutManagement');

router.route('/exercise_management/:username/:day').get(workoutManagementController.getExercises);      // Handles GET requests without ID
router.route('/exercise_management/:id/:username/:day').put(workoutManagementController.updateExercise)     // Handles PUT requests with ID
router.route('/exercise_management/day/:username/:selectDay').get(workoutManagementController.getDays)
router.route('/exercise_management/day/:username').post(workoutManagementController.createDays)
router.route('/exercise_management/update').post(workoutManagementController.saveDayTitle)
router.route('/exercise_management/all_workouts/:username').post(workoutManagementController.getAllWorkout)     // Handles PUT requests with ID
router.route('/exercise_management/delete/:username/:workout').delete(workoutManagementController.deleteExercise);      // Handles GET requests without ID

module.exports = router;
var express = require('express');
var router = express.Router();
const workoutManagementController = require('../controllers/workoutManagement');

// Route without ID for GET requests
router.route('/exercise_management/:username')
// console.log("🚀 ~ workoutManagementController:", workoutManagementController)

  .get(workoutManagementController.getExercises);      // Handles GET requests without ID

// Route with ID for PUT, POST, DELETE requests
router.route('/exercise_management/:id/:username')
  .put(workoutManagementController.updateExercise)     // Handles PUT requests with ID
  // .post(userController.createExercise)    // Handles POST requests with ID
  // .delete(userController.deleteExercise); // Handles DELETE requests with ID

module.exports = router;

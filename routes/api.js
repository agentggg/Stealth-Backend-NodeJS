var express = require('express');
var router = express.Router();
const apiController = require('../controllers/apiManagement');

router.get('/all_exercises', apiController.all_exercises);
router.get('/specific_target_exercise/name/:name', apiController.specific_target_exercise);
router.get('/all_filtered_list/:filter_by', apiController.all_filtered_list);
router.get('/all_filtered_list_exercises/:name', apiController.all_filtered_list_exercises);

module.exports = router;
  
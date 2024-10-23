var express = require('express');
var router = express.Router();
const apiController = require('../controllers/apiManagement');

router.get('/all_exercises', apiController.all_exercises);
router.get('/default_packages', apiController.default_packages);
router.get('/specific_target_exercise/name/:name', apiController.specific_target_exercise);
router.get('/all_filtered_list/:filter_by', apiController.all_filtered_list);
router.get('/all_filtered_list_exercises', apiController.all_filtered_list_exercises);
router.get('/custom_filter/:filter_name/:filter', apiController.custom_filter);

module.exports = router;
  
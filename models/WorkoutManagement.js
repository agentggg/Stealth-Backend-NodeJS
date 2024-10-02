const mongoose = require('mongoose');
const Exercise = require('./Exercises');  // Ensure these paths are correct
const User = require('./CustomUser');     // Ensure these paths are correct

const WorkoutManagement = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true }, // Use 'User' as a string
    workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }]        // Use 'Exercise' as a string

});

const Workouts = mongoose.model('WorkoutManagement', WorkoutManagement);

module.exports = Workouts;
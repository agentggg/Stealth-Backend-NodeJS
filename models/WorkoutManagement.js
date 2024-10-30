const mongoose = require('mongoose');


const WorkoutManagement = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Use 'User' as a string
    workouts: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },      // Use 'Exercise' as a string
    day: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' }
});

const Workouts = mongoose.model('WorkoutManagement', WorkoutManagement);

module.exports = Workouts;
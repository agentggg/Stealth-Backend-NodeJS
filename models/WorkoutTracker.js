const mongoose = require('mongoose');
const Exercise = require('./Exercises'); 
const User = require('./CustomUser');    

const WorkoutTracker = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },     
    set: { type: Number, default: 0 },
    rep: { type: Number, default: 0 }
});

// No unique constraints on user_id or workout
const Tracker = mongoose.model('WorkoutTracker', WorkoutTracker);

module.exports = Tracker;

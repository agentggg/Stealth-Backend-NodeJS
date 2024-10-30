const mongoose = require('mongoose');
  

const WorkoutTracker = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },     
    set: { type: Number, default: 0 },
    rep: { type: Number, default: 0 },
    day: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },   
});

// No unique constraints on user_id or workout
const Tracker = mongoose.model('WorkoutTracker', WorkoutTracker);

module.exports = Tracker;

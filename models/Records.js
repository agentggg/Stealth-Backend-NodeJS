const mongoose = require('mongoose');
const Exercise = require('./Exercises');  // Ensure these paths are correct
const User = require('./CustomUser');     // Ensure these paths are correct

const RecordsSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }], // Reference to Exercise model
    sets: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    time: { type: String, default: "05:21" },
    total_rest_time: { type: String, default: "17:32" },
    day_of_week: { type: String, default: "Monday" }

});

// Export as 'RecordStats'
const RecordStats = mongoose.model('RecordStats', RecordsSchema);

module.exports = RecordStats;

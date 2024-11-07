const mongoose = require('mongoose');
const today = new Date();
const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

console.log(formattedDate);

const RecordsSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }], // Reference to Exercise model
    sets: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    time: { type: String},
    total_rest_time: { type: String},
    day_of_week: { type: String },
    date: {type: String},
    workoutIntensity: {type: String}
});

// Export as 'RecordStats'
const RecordStats = mongoose.model('RecordStats', RecordsSchema);

module.exports = RecordStats;
 
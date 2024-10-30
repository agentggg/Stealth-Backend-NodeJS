const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    day: { type: String },     
    title: { type: String },
});

const Day = mongoose.model('Day', DaySchema);

module.exports = Day;

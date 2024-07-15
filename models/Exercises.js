const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    bodyPart: {
        type: String,
        required: true
    },
    equipment: {
        type: String,
        required: true
    },
    gifUrl: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    secondaryMuscles: {
        type: [String],
        required: true
    },
    instructions: {
        type: [String],
        required: true
    }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;

const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String
});

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;

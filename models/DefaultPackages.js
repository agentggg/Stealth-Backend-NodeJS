const mongoose = require('mongoose');

const DefaultPackages = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:'User', unique: true},
    custom_package_name: { type: String, required: true },
});

const Packages = mongoose.model('Packages', DefaultPackages);

module.exports = Packages;
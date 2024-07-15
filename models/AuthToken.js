const { default: mongoose } = require('mongoose');
const moment = require('moment') 
const User = require('./CustomUser')
const Group = require('./Group')
const currentDate = new Date();
const formattedDate = moment(currentDate).format('MM/DD/YY HH:mm:ss');

const AuthTokenSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    created_at: {type: Date, default: formattedDate},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:'User', unique: true},
});

const AuthToken = mongoose.model('AuthToken', AuthTokenSchema);

module.exports = AuthToken;

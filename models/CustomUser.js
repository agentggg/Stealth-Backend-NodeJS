const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const defaultGroupId = new mongoose.Types.ObjectId('668e160d1189c5010d026dd1'); // Correct instantiation with 'new'

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date.now },
    accessLevel: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: defaultGroupId },
    accountRetry: {type: Number, default:0},
    lastLoginAttempt: { type: Date, default: Date.now },
})

// Hash the password before saving it to the database
UserSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare the provided password with the stored hash
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
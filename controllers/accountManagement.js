const User = require('../models/CustomUser');
const Token = require('../models/AuthToken');
const crypto = require('crypto');

function generateRandomToken(size = 48) {
    return crypto.randomBytes(size).toString('hex');
};

exports.createUser = async (req, res) => {
    const body = req.body;
    try {
        // Save the user
        let saveUser = new User(body);
        await saveUser.save();
        
        // Generate and save the auth token
        const token = new Token({
            key: generateRandomToken(),
            user_id: saveUser._id
        });
        await token.save();
        // Respond with success
        res.status(201).json({
            status: "success",
            message: "Account created successfully",
        }); 
    } catch (error) {
        // Enhanced error handling
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            res.status(400).json({
                status: "failed",
                message: "Validation error",
                details: error.errors
            });
        } else if (error.code === 11000) {
            // Duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            res.status(409).json({
                status: "failed",
                message: `Duplicate value for field: ${field}`
            });
        } else if (error.name === 'MongoNetworkError') {
            // Database connection error
            res.status(500).json({
                status: "failed",
                message: "Database connection error"
            });
        } else {
            // Log unexpected errors for further analysis
            console.error('Unexpected error:', error);
            res.status(500).json({
                status: "failed",
                message: "An unexpected error occurred"
            });
        }
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            status: 'failed',
            message: 'Username and password are required'
        });
    }
    try {
        const userProfile = await User.findOne({ username });

        if (!userProfile) {
            return res.status(401).json({
                status: 'failed',
                message: 'Incorrect credentials'
            });
        }
        const isMatch = await userProfile.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'failed',
                message: 'Invalid username or password'
            });
        }

        let modifiedUserProfile = userProfile.toObject();
        delete modifiedUserProfile.password;
        delete modifiedUserProfile._id;
        delete modifiedUserProfile.__v;
        

        return res.status(200).json({
            status: 'successful',
            message: modifiedUserProfile,
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({
            status: 'failed',
            message: 'An unexpected error occurred'
        });
    }
};


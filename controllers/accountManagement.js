const User = require('../models/CustomUser');
const Token = require('../models/AuthToken');
const crypto = require('crypto');
const debugAuth = require('debug')('api:auth')
const debugTshoot = require('debug')('api:tshhot')

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
            debugAuth('Unexpected error:', error);
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
        debugAuth('Username or Password field missing')
        return res.status(400).json({
            status: 'failed',
            message: 'Username and password are required'
        });
    }
    try {
        const userProfile = await User.findOne({ username }).populate('accessLevel', 'name'); 
         
        if (!userProfile) {
            debugAuth('Incorrect username')
            return res.status(401).json({
                status: 'failed',
                message: 'Incorrect credentials'
            });
        }
        if (!userProfile.isActive){
            return res.status(403).json({
                status: 'failed',
                message: 'Your account is deactivated. Please reset your password.'
            });
        }
        const isMatch = await userProfile.comparePassword(password);
        if (!isMatch) {
            debugAuth('Incorrect password')
            const now = Date.now();
            const currentTime = new Date()
            const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
            const retrieveUsernameInstance = await User.findOne({ username })
            const retrieveUsernameLastLoginTime = retrieveUsernameInstance.lastLoginAttempt
            const futureTime = new Date(now + 1 * 60 * 1000); // 30 minutes in the future
            const retrieveUsernameRetryValue = retrieveUsernameInstance.accountRetry + 1
            const updatedTime = new Date(retrieveUsernameLastLoginTime.getTime() + LOCK_DURATION);
            debugTshoot("🚀 ~ exports.login= ~ updatedTime:", updatedTime)
            debugTshoot("🚀 ~ exports.login= ~ retrieveUsernameLastLoginTime:", retrieveUsernameLastLoginTime)
            debugTshoot("🚀 ~ exports.login= ~ currentTime:", currentTime)
            debugTshoot("🚀 ~ exports.login= ~ futureTime:", futureTime)

            
            if (retrieveUsernameRetryValue === 4) {
                debugAuth('Account is now deactivated for 30 minutes');
                await User.findOneAndUpdate(
                    { username: username },
                    {
                        lastLoginAttempt: currentTime,
                        accountRetry: retrieveUsernameRetryValue
                    },
                    { new: true }
                );
                return res.status(403).json({
                    status: 'failed',
                    message: 'Account is deactivated for 30 minutes'
                });
            } else if (retrieveUsernameRetryValue > 4 && retrieveUsernameRetryValue < 7 && currentTime < updatedTime) {
                debugAuth('Account is still locked');
                return res.status(403).json({
                    status: 'failed',
                    message: 'Account is still locked'
                });
            } else if (retrieveUsernameRetryValue > 4 && retrieveUsernameRetryValue < 7 && currentTime >= updatedTime) {
                debugAuth('Account is no longer locked');
                await User.findOneAndUpdate(
                    { username: username },
                    { accountRetry: retrieveUsernameRetryValue },
                    { new: true }
                );
                return res.status(401).json({
                    status: 'failed',
                    message: 'Invalid username or password'
                });
            } else if (retrieveUsernameRetryValue === 7) {
                debugAuth('Account is now deactivated');
                await User.findOneAndUpdate(
                    { username: username },
                    { isActive: false },
                    { new: true }
                );
                return res.status(403).json({
                    status: 'failed',
                    message: 'Your account is deactivated. Please reset your password.'
                });
            } else {
                // Increment the retry count and continue
                debugAuth('Invalid password');
                await User.findOneAndUpdate(
                    { username: username },
                    { accountRetry: retrieveUsernameRetryValue },
                    { new: true }
                );
                return res.status(401).json({
                    status: 'failed',
                    message: 'Invalid username or password'
                });
            }              
        }

        let modifiedUserProfile = userProfile.toObject();
        delete modifiedUserProfile.password;
        delete modifiedUserProfile._id;
        delete modifiedUserProfile.__v;
        delete modifiedUserProfile.accessLevel._id
        

        return res.status(200).json({
            status: 'successful',
            message: modifiedUserProfile,
        });
    } catch (error) {
        debugAuth('Unexpected error:', error);
        return res.status(500).json({
            status: 'failed',
            message: 'An unexpected error occurred'
        });
    }
};


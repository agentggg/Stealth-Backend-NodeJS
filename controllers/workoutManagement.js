const Workouts = require('../models/WorkoutManagement');
const Exercise = require('../models/Exercises');
const User = require('../models/CustomUser')
const Tracker = require('../models/WorkoutTracker')

exports.updateExercise = async (req, res) => {
    try {
        const { username, id } = req.params;
        const find_user = await User.findOne({ username: username });
        const workout_item = await Exercise.findOne({ _id: id });

        const update = await Workouts.updateOne(
            { user_id: find_user._id },
            { $addToSet: { workouts: workout_item._id } } // Add workout only if it's not already in the array
        );
        if (update.matchedCount === 0) {
            await Workouts.create({
                user_id: find_user._id,
                workouts: [workout_item._id] // Initialize with this workout
            });

            // Create a tracker entry
            await Tracker.create({
                user_id: find_user._id,
                workout: workout_item._id,
                set: 0,
                rep: 0
            });

            return res.status(200).json({
                status: 'success',
                message: 'Workout created and tracker added'
            });
        }

        // If the workout was already in the list but no tracker exists, create one
        const workoutDocument = await Workouts.findOne({ user_id: find_user._id });
        const userWorkouts = workoutDocument.workouts;

        // Loop through the user's workouts and check if a tracker exists for each workout
        for (let workoutId of userWorkouts) {
            const trackerExists = await Tracker.findOne({
                user_id: find_user._id,
                workout: workoutId
            });

            if (!trackerExists) {
                await Tracker.create({
                    user_id: find_user._id,
                    workout: workoutId,
                    set: 0,
                    rep: 0
                });
            }
        }

        return res.status(200).json({
            status: 'success',
            message: 'Workouts added to set and trackers updated'
        });

    } catch (error) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(200).json({
                status: 'success',
                message: `Workout already added to your sets`
            });
        }

        return res.status(500).json({
            status: 'failure',
            message: 'Server error',
            error
        });
    }
};

exports.getExercises = async(req, res) => {
    try{
        const username_param = req.params.username;
        const username_id = await User.findOne({username:username_param})
        const my_workout_document = await Workouts.find({user_id:username_id._id}).populate('workouts')
        res.status(200).json({ 
            status:'success',
            message:my_workout_document
        })
    } catch(err){
        res.status(200).json({ 
            status:'error',
            message:'Error retrieving data'
        })
    }
}     
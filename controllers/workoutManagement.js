const Workouts = require('../models/WorkoutManagement');
const Exercise = require('../models/Exercises');
const User = require('../models/CustomUser')
const Tracker = require('../models/WorkoutTracker')
const Day = require('../models/Days')

exports.updateExercise = async (req, res) => {
    try {
        const { username, id, day } = req.params;
        const find_user = await User.findOne({ username: username });
        const workout_item = await Exercise.findOne({ _id: id });
        const workout_day = await Day.findOne({day:day, user_id:find_user._id})
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
                    rep: 0,
                    day: workout_day._id
                });
            }
        }

        return res.status(200).json({
            status: 'success',
            message: 'Workouts added to set and trackers updated'
        });

    } catch (error) {
        console.log("🚀 ~ exports.updateExercise= ~ error:", error)
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
        const username_param = req.params.username
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
exports.getDays = async(req, res) => {
    try{
        const username = req.params.username
        const selected_day = req.params.selectDay
        const username_instance = await User.find({username:username})
        const day = await Day.find({user_id:username_instance[0]._id, day:selected_day}) 
        res.status(200).json({
            status:'success',
            message:day
        })
    }   catch(err){
            console.log("🚀 ~ exports.getDays=async ~ err:", err)
            res.status(200).json({
                status:'error',
                message:'Error retrieving data'
            })
    }
}
exports.createDays = async(req, res) => {
    try{
        const username =  req.params.username
        const username_instance = await User.find({username:username})
        const days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        days_of_week.map(async(each_day)=>{
            const existingDay = await Day.findOne(
                {
                    user_id:username_instance,
                    day:each_day
                }
            )
            if (!existingDay){
                const create_profile = new Day({
                    user_id: username_instance[0]._id,
                    day: each_day,
                    title: 'Categorize this day according to your liking'
                })
                create_profile.save()
            }else{
                console.log(`Skipping ${each_day} for ${username_instance[0].fullName}`)
            }
        })
        res.status(200).json({
            status:'successful',
            message:'create_days'
            })
    }catch(err){ 
        console.log("🚀 ~ exports.createDays=async ~ err:", err)
        console.log('error')
        }
}
exports.saveDayTitle = async(req, res) => {
    try{
        const {username, day, title} = req.body
        const username_instance = await User.find({username:username})
        const result = await Day.updateOne(
            { user_id: username_instance[0]._id, day: day },
            { title: title }
        )
        if (result.matchedCount === 0) {
            console.log('No matching document found');
            } else {
            console.log('Document updated successfully');
            res.status(200).json({
                status:'successful',
                message:'successful'
            })
            }
            
    } catch (error) {
        console.error('Error updating document:', error);
    }
}   

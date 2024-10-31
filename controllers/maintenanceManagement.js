const axios = require('axios')
const User = require('../models/CustomUser')
const RecordStats = require('../models/Records')
const Tracker = require('../models/WorkoutTracker')
const Workouts = require('../models/WorkoutManagement')

exports.user_workouts = async(req, res) => {
    let response = []
    username = req.params.username
    user_id = await User.find({username:username})
    try{
        const deleted_records = await RecordStats.deleteMany({user_id:user_id[0]._id})
        const deleted_workout_trackers = await Tracker.deleteMany({user_id:user_id})
        const deleted_workouts = await Workouts.deleteMany({user_id:user_id})

        response.push(
            {
                Records: deleted_records.deletedCount,
                Notes: "Stat Record Keeping"
            },
            {
                Tracker: deleted_workout_trackers.deletedCount,
                Notes:"Track workout session reps, sets, time, etc."
            },
            {
                Workouts: deleted_workouts.deletedCount,
                Notes: "Workouts and days that the user has opt-in"
            }
        )
        res.status (200).json({
            status:'success',
            message:response
        }) 
    }catch(err){
        console.log("🚀 ~ exports.user_workouts=async ~ err:", err)
        res.status(200).json({
            status:'failed', 
            message:'not deleted' 
        })
         
    }
} 


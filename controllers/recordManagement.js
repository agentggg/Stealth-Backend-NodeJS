const User = require('../models/CustomUser')
const RecordStats = require('../models/Records'); 
const Exercise = require('../models/Exercises')
const moment = require('moment')


exports.add = async (req, res) => {
    try{
        const { workout_id, username, sets, reps, time, total_rest_time, weight, workoutIntensity, day_of_week, date } = req.body;
        console.log("🚀 ~ exports.add= ~ req.body:", req.body)
        const username_lookup = await User.findOne({ username: username });
        const exercise_lookup = await Exercise.findOne({ _id: workout_id });
        console.log("🚀 ~ exports.add= ~ exercise_lookup:", exercise_lookup)

        create_record = await RecordStats.create({ 
            user_id:username_lookup,
            workouts:exercise_lookup,
            sets:sets,
            reps:reps,
            time:time,
            day_of_week:day_of_week,
            weight:weight,
            workoutIntensity:workoutIntensity,
            date:date
        })
        res.status(200).json({
            status:'success',
            message:'successfully created a new entry'
        })
        
    } catch(err){
        console.log("🚀 ~ exports.add= ~ err:", err)
        res.send(500).json({ 
            status:'failed',
            message:err
        })
    } 
}  

exports.analytics = async(req, res) => {
    username = req.query.username
    username_instance = await User.findOne({username:username})

    const response = await RecordStats.aggregate([
        {
            $lookup: {
                from: 'exercises', // Ensure collection name is correct (usually lowercase and plural)
                localField: 'workouts', // Field in RecordStats
                foreignField: '_id', // Field in Exercise collection
                as: 'full_workout' // Name for the joined data
            }
        },
        {
            $project: {
                "__v": 0, // Exclude __v from RecordStats
                "full_workout.__v": 0  // Exclude __v from the joined Exercise documents
            }
        }
    ]).exec();
    
    res.status(200).json({
        status:'successful',
        data:response
    })
}

exports.set_history = async(req, res) => {
    username = req.query.username
    workout_id = req.query.workout_id    
    username_instance = await User.find({username:username})
    stat = await RecordStats.find({user_id:username_instance[0]._id})
    response = stat.slice(-1)
    res.status(200).json({
        status:'successful',
        data:response
    })
}
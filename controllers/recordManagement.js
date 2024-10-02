const User = require('../models/CustomUser')
const RecordStats = require('../models/Records'); 
const Exercise = require('../models/Exercises')
const moment = require('moment')


exports.add = async (req, res) => {
    try{
        const { workout_id, username, sets, reps, time, total_rest_time } = req.body;
        const username_lookup = await User.findOne({ username: username });
        const exercise_lookup = await Exercise.findOne({ _id: workout_id });
        const today = moment();
        const day_of_week = today.format('dddd'); 
        create_record = await RecordStats.create({ 
            user_id:username_lookup,
            workouts:exercise_lookup,
            sets:sets,
            reps:reps,
            time:time,
            total_rest_time:total_rest_time,
            day_of_week:day_of_week
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
  
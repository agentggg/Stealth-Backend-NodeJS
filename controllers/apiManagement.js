const axios = require('axios')
const savedExercise = require('../models/Exercises');

exports.all_exercises = async (req, res) => {
    const url = 'https://exercisedb.p.rapidapi.com/exercises?offset=0&limit=0';
    const headers = {
        'x-rapidapi-key': '90241abac8mshff4bf57dd4f55f7p1a7d24jsnd7aa77394a4e',
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    };

    try {
        const response = await axios.get(url, { headers });
        const result = await response.data;
        let updated = 0;
        let created = 0;

        await Promise.all(result.map(async (eachItem) => {
            const existingDocument = await savedExercise.findOne({ id: eachItem.id });
            const databaseEntry = await savedExercise.findOneAndUpdate(
                { id: eachItem.id },
                eachItem,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            if (existingDocument) {
                updated += 1;
            } else {
                created += 1;
            }
        }));

        res.status(200).send({
            status: 'successful',
            message: {
                updatedEntries: updated,
                createdEntries: created
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({
            status: 'failed',
            message: 'failed to update the database',
        });
    }
};

exports.specific_target_exercise = async(req, res) => {
    const name = (req.params.name)
    try {
        const response = await savedExercise.find({ target: name}).exec();
        // delete response[0].bodyPart
        if (response.length != 0){
            res.status (200).json({
                status: 'success',
                message: response
            })
        }
        else{
            res.status(400).send({
                status: 'failed',
                message: 'failed to retrieve exercise name',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send({
            status: 'failed',
            message: 'failed to retrieve exercise name',
        });
    }
}

exports.targeted_list = async(req, res) => {
    try {
        result = await savedExercise.find({}, 'bodyPart -_id').exec()
        let response = []
        result.map((eachItem)=>{
            if (!response.includes(eachItem.bodyPart)){
                response.push(eachItem.bodyPart)
            }
        })
        if (response.length != 0){
            res.status (200).json({
                status: 'success',
                message: response
            })
        }
        else{
            res.status(400).send({
                status: 'failed',
                message: 'failed to retrieve exercise name',
            });
        }
    }catch (error) {
        console.error(error);
        res.status(400).send({
            status: 'failed',
            message: 'failed to retrieve exercise name',
        });
    }
}

exports.all_filtered_list = async(req, res) => {
    const filter = req.params.filter_by
    try {
        result = await savedExercise.find({}, `${filter} -_id`).exec()
        let response = []
        result.map((eachItem)=>{
            if (!response.includes(eachItem[filter])){
                response.push(eachItem[filter])
            }
        })
        if (response.length != 0){
            res.status (200).json({
                status: 'success',
                message: response
            })
        }
        else{
            res.status(400).send({
                status: 'failed',
                message: 'failed to retrieve exercise name',
            });
        }
    }catch (error) {
        console.error(error);
        res.status(400).send({
            status: 'failed',
            message: 'failed to retrieve exercise name',
        });
    }
}

exports.all_filtered_list_exercises = async(req, res) => {
    const category_selected = req.params.name
    const filter_criteria = req.query.filter_criteria
    try {
        response = await savedExercise.find({[category_selected]:filter_criteria}).exec() 
        if (response.length != 0){
            res.status (200).json({
                status: 'success',
                message: response
            })
        }
        else{
            res.status(400).send({
                status: 'failed',
                message: 'failed to retrieve exercise name',
            });
        }
    }catch (error) {
        console.error(error);
        res.status(400).send({
            status: 'failed',
            message: 'failed to retrieve exercise name',
        });
    }
}

exports.custom_filter = async(req, res) => {
    const filterType = req.params.filter_name
    const filterCriteria = req.params.filter
    try{
        const response = await savedExercise.find({[filterType]:filterCriteria}).exec()
        console.log(response)
        if (response.length < 1) {
            throw new Error('No value found')
        }
        res.status (200).json({
            status: 'success',
            message: response
        })
    }   
    catch(error){
        console.error(error);
        res.status(400).send({
            status: 'failed',
            message: `failed to retrieve ${filterType} name ${filterCriteria}`,
        });
    } 
}


exports.default_packages = async(req, res) => {
    const all = await savedExercise.find({})
    let bodyParts = await axios('http://127.0.0.1:3000/api/all_filtered_list/bodyPart')
    bodyParts = bodyParts.data.message
    bodyParts.forEach((eachPart) => {
        const variableName = eachPart
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w_]/g, '');
        eval(`global.${variableName} = []`);
      });

      console.log(global.head); // Output: ['hat']


    all.map((bodyParts)=>{
        bodyParts.push(eachItem.bodyPart) 
    })
    do { 
        const randomElement = all[Math.floor(Math.random() * all.length)]
        waist.push(randomElement)
    }while (packages.length < 3)
} 


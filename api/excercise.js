const axios = require('axios');

const all_exercises = async() => {
    const url = 'https://exercisedb.p.rapidapi.com/exercises';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '90241abac8mshff4bf57dd4f55f7p1a7d24jsnd7aa77394a4e',
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
    }
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result
    } catch (error) {
        console.error(error);
        return error
    }
}

module.exports = all_exercises  
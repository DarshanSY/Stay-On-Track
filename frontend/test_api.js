const axios = require('axios');

async function test() {
    try {
        console.log('Sending request...');
        const response = await axios.post('http://localhost:5000/api/interventions', {
            student_id: 'STU001',
            title: 'Test Plan Axios',
            type: 'Academic Support',
            description: 'Test Description Axios',
            status: 'Planned',
            assigned_to: 'Counselor'
        });
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

test();

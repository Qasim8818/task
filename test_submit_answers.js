const axios = require('axios');

async function testSubmitAnswers() {
  try {
    // Replace with actual studentId and taskId from your database
    const studentId = 5;
    const taskId = 3;

    // Start the task to record startTime
    const startResponse = await axios.post('http://localhost:3000/student/start-task', {
      studentId,
      taskId,
    });
    console.log('Start Task Response:', startResponse.data);

    // Prepare answers - example with some correct and incorrect options
    const answers = [
      { mcqId: 1, selectedOption: 0 },
      { mcqId: 2, selectedOption: 1 },
      { mcqId: 3, selectedOption: 0 },
      // Add more answers as needed
    ];

    // Submit answers
    const submitResponse = await axios.post('http://localhost:3000/student/submit-answers', {
      studentId,
      taskId,
      answers,
    });
    console.log('Submit Answers Response:', submitResponse.data);

    // Check score and imageUrl
    const { score, imageUrl, attemptTime } = submitResponse.data;
    console.log(`Score: ${score}, Attempt Time: ${attemptTime} ms`);
    console.log(`Image URL (base64): ${imageUrl}`);

  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSubmitAnswers();

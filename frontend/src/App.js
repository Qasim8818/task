import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mcqs, setMcqs] = useState([{ question: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [studentsResults, setStudentsResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStudentsResults();
    } else if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  const fetchStudentsResults = async () => {
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/admin/students-results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentsResults(response.data);
    } catch (err) {
      setError('Failed to fetch students results.');
    }
  };

  const fetchStudents = async () => {
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/admin/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students.');
    }
  };

  const createTask = async () => {
    setError('');
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3000/admin/upload-task', {
        title,
        description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaskId(response.data.id);
      setMessage('Task created successfully. Now upload MCQs.');
    } catch (err) {
      setError('Failed to create task.');
    }
  };

  const handleMcqChange = (index, field, value) => {
    const newMcqs = [...mcqs];
    if (field === 'question') {
      newMcqs[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.slice(-1));
      newMcqs[index].options[optionIndex] = value;
    } else if (field === 'correctOptionIndex') {
      newMcqs[index].correctOptionIndex = parseInt(value);
    }
    setMcqs(newMcqs);
  };

  const addMcq = () => {
    setMcqs([...mcqs, { question: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  };

  const uploadMcqs = async () => {
    setError('');
    setMessage('');
    try {
      await axios.post('http://localhost:3000/admin/upload-mcqs', {
        taskId,
        mcqs,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('MCQs uploaded successfully.');
    } catch (err) {
      setError('Failed to upload MCQs.');
    }
  };

  const registerStudent = async () => {
    setRegisterMessage('');
    setError('');
    // try {
      await axios.post('http://localhost:3000/admin/register-student', {
        username: registerUsername,
        password: registerPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegisterMessage('Student registered successfully.');
      setRegisterUsername('');
      setRegisterPassword('');
    // } catch (err) {
    //   if (err.response && err.response.status === 401) {
    //     setError('Unauthorized: Please login again.');
    //   } else {
    //     setError('Failed to register student.');
    //   }
    // }
  // };
    }
  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', backgroundColor: 'darkolivegreen', padding: '20px', borderRadius: '8px' }}>
      <h2 style={{ color: '#d2b48c' }}>Admin Dashboard</h2>
      <button onClick={onLogout} style={{ marginBottom: '20px', backgroundColor: '#d2b48c', color: '#ffb6c1', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ marginRight: '10px', background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)', color: '#d2b48c', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Dashboard</button>
        <button onClick={() => setActiveTab('tasks')} style={{ marginRight: '10px', background: 'linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red)', color: '#d2b48c', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Tasks</button>
        <button onClick={() => setActiveTab('students')} style={{ marginRight: '10px', background: 'linear-gradient(to right, orange, yellow, green, blue, indigo, violet, red)', color: '#d2b48c', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Students</button>
        <button onClick={() => setActiveTab('register')} style={{ marginRight: '10px', background: 'linear-gradient(to right, yellow, green, blue, indigo, violet, red, orange)', color: '#d2b48c', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Register Student</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {registerMessage && <p style={{ color: 'green' }}>{registerMessage}</p>}

      {activeTab === 'dashboard' && (
        <div>
          <h3>Students Results</h3>
          {studentsResults.length === 0 ? (
            <p>No results available.</p>
          ) : (
            <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Task</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {studentsResults.map((result, idx) => (
                  <tr key={idx}>
                    <td>{result.studentUsername}</td>
                    <td>{result.taskTitle}</td>
                    <td>{result.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <h3>Create Task</h3>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button onClick={createTask} style={{ padding: '10px 20px' }}>Create Task</button>

          {taskId && (
            <div style={{ marginTop: '30px' }}>
              <h3>Upload MCQs for Task ID: {taskId}</h3>
              {mcqs.map((mcq, idx) => (
                <div key={idx} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                  <input
                    type="text"
                    placeholder="Question"
                    value={mcq.question}
                    onChange={e => handleMcqChange(idx, 'question', e.target.value)}
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  {mcqs[idx].options.map((option, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={option}
                      onChange={e => handleMcqChange(idx, `option${i}`, e.target.value)}
                      style={{ width: '100%', marginBottom: '5px' }}
                    />
                  ))}
                  <label>
                    Correct Option:
                    <select
                      value={mcq.correctOptionIndex}
                      onChange={e => handleMcqChange(idx, 'correctOptionIndex', e.target.value)}
                    >
                      {[0, 1, 2, 3].map(i => (
                        <option key={i} value={i}>{`Option ${i + 1}`}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
              <button onClick={addMcq} style={{ marginRight: '10px' }}>Add MCQ</button>
              <button onClick={uploadMcqs}>Upload MCQs</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div>
          <h3>Students</h3>
          {students.length === 0 ? (
            <p>No students found.</p>
          ) : (
            <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Tasks Attempted</th>
                  <th>Results</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.username}</td>
                    <td>{student.tasksAttempted}</td>
                    <td>{student.resultsSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'register' && (
        <div>
          <h3>Register Student</h3>
          <input
            type="text"
            placeholder="Username"
            value={registerUsername}
            onChange={e => setRegisterUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={registerPassword}
            onChange={e => setRegisterPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button onClick={registerStudent} style={{ padding: '10px 20px' }}>Register</button>
        </div>
      )}
    </div>
  );
}

function StudentDashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'attend') {
      fetchTasks();
    } else if (activeTab === 'results') {
      fetchResults();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/student/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming response contains overall data and results
      // You can set state accordingly
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    }
  };

  const fetchTasks = async () => {
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/student/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks.');
    }
  };

  const fetchMCQs = async (taskId) => {
    setSelectedTaskId(taskId);
    setError('');
    try {
      const response = await axios.get(`http://localhost:3000/student/mcqs/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMcqs(response.data);
      setAnswers({});
      setResult(null);
    } catch (err) {
      setError('Failed to fetch MCQs.');
    }
  };

  const handleAnswerChange = (mcqId, optionIndex) => {
    setAnswers({ ...answers, [mcqId]: optionIndex });
  };

  const submitAnswers = async () => {
    setError('');
    const payload = {
      taskId: selectedTaskId,
      answers: Object.entries(answers).map(([mcqId, optionIndex]) => ({
        mcqId: parseInt(mcqId),
        selectedOptionIndex: optionIndex,
      })),
    };
    try {
      const response = await axios.post('http://localhost:3000/student/submit-answers', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to submit answers.');
    }
  };

  const fetchResults = async () => {
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/student/results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming response contains student's results
      // Set state accordingly
    } catch (err) {
      setError('Failed to fetch results.');
    }
  };

  const fetchLeaderboard = async () => {
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/student/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(response.data);
    } catch (err) {
      setError('Failed to fetch leaderboard.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', backgroundColor: 'darkolivegreen', padding: '20px', borderRadius: '8px' }}>
      <h2 style={{ color: '#d2b48c' }}>Student Dashboard</h2>
      <button onClick={onLogout} style={{ marginBottom: '20px', backgroundColor: '#d2b48c', color: '#ffb6c1', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ marginRight: '10px', background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)', color: '#d2b48c', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Dashboard</button>
        <button onClick={() => setActiveTab('attend')} style={{ marginRight: '10px', background: 'linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red)', color: '#d2b48c', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Attend Task</button>
        <button onClick={() => setActiveTab('results')} style={{ marginRight: '10px', background: 'linear-gradient(to right, orange, yellow, green, blue, indigo, violet, red)', color: '#d2b48c', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Results</button>
        <button onClick={() => setActiveTab('leaderboard')} style={{ marginRight: '10px', background: 'linear-gradient(to right, yellow, green, blue, indigo, violet, red, orange)', color: '#d2b48c', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Leaderboard</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {activeTab === 'dashboard' && (
        <div>
          <h3>Overall Data and Results</h3>
          {/* Display overall data and results here */}
          <p>Coming soon...</p>
        </div>
      )}

      {activeTab === 'attend' && (
        <div>
          {!selectedTaskId ? (
            <div>
              <h3>Available Tasks</h3>
              {tasks.length === 0 ? (
                <p>No tasks available.</p>
              ) : (
                <ul>
                  {tasks.map(task => (
                    <li key={task.id} style={{ marginBottom: '10px' }}>
                      {task.title} - <button onClick={() => fetchMCQs(task.id)}>Start Task</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div>
              <h3>Task MCQs</h3>
              {mcqs.map(mcq => (
                <div key={mcq.id} style={{ marginBottom: '20px' }}>
                  <p>{mcq.question}</p>
                  {mcq.options.map((option, idx) => (
                    <label key={idx} style={{ display: 'block', marginBottom: '5px' }}>
                      <input
                        type="radio"
                        name={`mcq-${mcq.id}`}
                        checked={answers[mcq.id] === idx}
                        onChange={() => handleAnswerChange(mcq.id, idx)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ))}
              <button onClick={submitAnswers} style={{ padding: '10px 20px' }}>Submit Answers</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div>
          <h3>Your Results</h3>
          {/* Display student's results here */}
          <p>Coming soon...</p>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div>
          <h3>Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p>No leaderboard data available.</p>
          ) : (
            <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Tasks Completed</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? '#cd7f32' : 'transparent' }}>
                    <td>{idx + 1}</td>
                    <td>{entry.studentUsername}</td>
                    <td>{entry.tasksCompleted}</td>
                    <td>{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async () => {
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password,
      });
      console.log('Login response:', response);
      if (response.data.user.role !== 'admin') {
        setError('Not an admin user');
        return;
      }
      onLogin(response.data.access_token, 'admin');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Admin Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '10px' }}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <button onClick={login} style={{ padding: '10px 20px' }}>Login</button>
    </div>
  );
}

function StudentLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async () => {
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password,
      });
      if (response.data.user.role !== 'student') {
        setError('Not a student user');
        return;
      }
      onLogin(response.data.access_token, 'student');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Student Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '10px' }}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <button onClick={login} style={{ padding: '10px 20px' }}>Login</button>
    </div>
  );
}

function App() {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');

  const handleLogin = (token, role) => {
    setToken(token);
    setRole(role);
  };

  const handleLogout = () => {
    setToken('');
    setRole('');
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <AdminLogin onLogin={handleLogin} />
        <StudentLogin onLogin={handleLogin} />
      </div>
    );
  }

  if (role === 'admin') {
    return <AdminDashboard token={token} onLogout={handleLogout} />;
  }

  if (role === 'student') {
    return <StudentDashboard token={token} onLogout={handleLogout} />;
  }

  return null;
}

export default App;

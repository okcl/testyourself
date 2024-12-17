import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';

const CreateQuestionPage = () => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('single');
  const [options, setOptions] = useState(['', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerToggle = (index) => {
    const currentIndex = correctAnswers.indexOf(index);
    const newCorrectAnswers = [...correctAnswers];

    if (currentIndex > -1) {
      newCorrectAnswers.splice(currentIndex, 1);
    } else {
      if (questionType === 'single') {
        newCorrectAnswers.length = 0;
      }
      newCorrectAnswers.push(index);
    }

    setCorrectAnswers(newCorrectAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/questions', {
        text: questionText,
        type: questionType,
        options,
        correctAnswers
      });
      alert('Question added successfully!');
      // Reset form
      setQuestionText('');
      setOptions(['', '', '']);
      setCorrectAnswers([]);
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Question Type:</label>
          <select 
            value={questionType} 
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="single">Single Choice</option>
            <option value="multiple">Multiple Choice</option>
          </select>
        </div>

        <div>
        <label className="block mb-2 text-lg font-semibold">Question Text:</label>
          <textarea 
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required 
            rows="5" 
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the question text here..."
          ></textarea>
        </div>

        <div>
          <label className="block mb-2">Answer Options:</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input 
                type="text" 
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-grow p-2 border rounded mr-2"
                placeholder={`Option ${index + 1}`}
              />
              <input 
                type={questionType === 'single' ? 'radio' : 'checkbox'}
                name="correct-answer"
                checked={correctAnswers.includes(index)}
                onChange={() => handleCorrectAnswerToggle(index)}
                className="mr-2"
              />
              <span>Correct</span>
            </div>
          ))}
          <button 
            type="button" 
            onClick={handleAddOption}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Option
          </button>
        </div>

        <button 
          type="submit" 
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save Question
        </button>
      </form>
    </div>
  );
};

const TestModePage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [resultsDetail, setResultsDetail] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        
        // Randomize questions and fix correct answers after shuffling
        const randomizedQuestions = response.data.map(q => {
          // Create a shuffled array with options and their original indices
          const shuffledOptions = q.options
            .map((option, index) => ({ option, originalIndex: index }))
            .sort(() => 0.5 - Math.random());
  
          // Adjust the correct answers based on the shuffled options
          const updatedCorrectAnswers = shuffledOptions
            .filter(item => q.correct_answers.includes(item.originalIndex))
            .map(item => shuffledOptions.indexOf(item));
  
          return {
            ...q,
            options: shuffledOptions.map(item => item.option), // Extract only the option text
            correct_answers: updatedCorrectAnswers, // Update correct answer indices
          };
        });
  
        setQuestions(randomizedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
  
    fetchQuestions();
  }, []);
  

  const handleAnswerSelect = (questionId, optionIndex) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newSelectedAnswers = {...selectedAnswers};

    if (currentQuestion.type === 'single') {
      newSelectedAnswers[questionId] = [optionIndex];
    } else {
      const currentSelected = newSelectedAnswers[questionId] || [];
      const optionExists = currentSelected.includes(optionIndex);

      if (optionExists) {
        newSelectedAnswers[questionId] = currentSelected.filter(idx => idx !== optionIndex);
      } else {
        newSelectedAnswers[questionId] = [...currentSelected, optionIndex];
      }
    }

    setSelectedAnswers(newSelectedAnswers);
  };

  const submitTest = () => {
    const testResults = questions.map((question, index) => {
      // Convert saved correct answers to their original indices
      const correctAnswerIndices = question.correct_answers;
      
      // Get user's selected answers for this question
      const userAnswers = selectedAnswers[index] || [];
      
      // Precise comparison for correctness
      const isCorrect = (
        userAnswers.length === correctAnswerIndices.length &&
        userAnswers.every(answer => correctAnswerIndices.includes(answer)) &&
        correctAnswerIndices.every(answer => userAnswers.includes(answer))
      );

      return {
        questionId: index,
        questionText: question.text,
        userAnswers: userAnswers.map(a => question.options[a]),
        correctAnswers: correctAnswerIndices.map(a => question.options[a]),
        isCorrect: isCorrect
      };
    });

    // Calculate score and set results
    const correctQuestions = testResults.filter(result => result.isCorrect);
    setScore(correctQuestions.length);
    setResultsDetail(testResults);
    setTestCompleted(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitTest();
    }
  };

  if (questions.length === 0) return <div>Loading questions...</div>;
  
  if (testCompleted) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Test Completed!</h2>
        <p className="text-xl mb-4">Your Score: {score} / {questions.length}</p>
        
        <div>
          {resultsDetail.map((result, index) => (
            <div 
              key={index} 
              className={`p-4 mb-4 rounded ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
            >
              <p className="font-bold">{result.questionText}</p>
              <p className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
                {result.isCorrect ? 'Correct' : 'Incorrect'}
              </p>
              <div>
                <p>Your answers: {result.userAnswers.join(', ')}</p>
                <p>Correct answers: {result.correctAnswers.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Question {currentQuestionIndex + 1} of {questions.length}
      </h2>
      <div className="mb-4">
        <p className="text-lg">{currentQuestion.text}</p>
      </div>
      <div>
        {currentQuestion.options.map((option, optionIndex) => (
          <div key={optionIndex} className="mb-2">
            {currentQuestion.type === 'single' ? (
              <label className="flex items-center">
                <input
                  type="radio"
                  name="answer"
                  checked={(selectedAnswers[currentQuestionIndex] || [])[0] === optionIndex}
                  onChange={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                  className="mr-2"
                />
                {option}
              </label>
            ) : (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={(selectedAnswers[currentQuestionIndex] || []).includes(optionIndex)}
                  onChange={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                  className="mr-2"
                />
                {option}
              </label>
            )}
          </div>
        ))}
      </div>
      <button 
        onClick={nextQuestion}
        disabled={!selectedAnswers[currentQuestionIndex]}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
      </button>
    </div>
  );
};

const QuestionManagementPage = () => {
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  // Start editing a question
  const startEditing = (question) => {
    setEditingQuestion({
      ...question,
      options: [...question.options],
      correct_answers: [...question.correct_answers]
    });
  };

  // Update question in editing state
  const handleEditChange = (field, value) => {
    setEditingQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update option in editing state
  const updateOption = (index, value) => {
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // Toggle correct answer
  const toggleCorrectAnswer = (optionIndex) => {
    const currentQuestion = editingQuestion;
    const newCorrectAnswers = [...currentQuestion.correct_answers];
    const correctIndex = newCorrectAnswers.indexOf(optionIndex);

    if (correctIndex > -1) {
      // Remove if already in correct answers
      newCorrectAnswers.splice(correctIndex, 1);
    } else {
      // Add to correct answers
      if (currentQuestion.type === 'single') {
        // For single choice, replace existing
        newCorrectAnswers.length = 0;
      }
      newCorrectAnswers.push(optionIndex);
    }

    setEditingQuestion(prev => ({
      ...prev,
      correct_answers: newCorrectAnswers
    }));
  };

  // Save edited question
  const saveQuestion = async () => {
    try {
      await axios.put(`http://localhost:5000/api/questions/${editingQuestion.id}`, {
        text: editingQuestion.text,
        type: editingQuestion.type,
        options: editingQuestion.options,
        correctAnswers: editingQuestion.correct_answers
      });
      
      // Refresh questions list
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data);
      
      // Clear editing state
      setEditingQuestion(null);
      
      alert('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    }
  };

  // Delete question
  const deleteQuestion = async (questionId) => {
    try {
      await axios.delete(`http://localhost:5000/api/questions/${questionId}`);
      
      // Refresh questions list
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data);
      
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Questions</h2>
      
      {questions.map((question, index) => (
        <div 
          key={question.id} 
          className="border p-4 mb-4 rounded bg-white shadow"
        >
          {editingQuestion && editingQuestion.id === question.id ? (
            // Editing View
            <div>
              <input 
                type="text"
                value={editingQuestion.text}
                onChange={(e) => handleEditChange('text', e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              
              <select 
                value={editingQuestion.type}
                onChange={(e) => handleEditChange('type', e.target.value)}
                className="w-full p-2 border rounded mb-2"
              >
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
              </select>
              
              {editingQuestion.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center mb-2">
                  <input 
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(optionIndex, e.target.value)}
                    className="flex-grow p-2 border rounded mr-2"
                  />
                  <input 
                    type={editingQuestion.type === 'single' ? 'radio' : 'checkbox'}
                    checked={editingQuestion.correct_answers.includes(optionIndex)}
                    onChange={() => toggleCorrectAnswer(optionIndex)}
                    className="mr-2"
                  />
                  <span>Correct</span>
                </div>
              ))}
              
              <div className="flex space-x-2 mt-4">
                <button 
                  onClick={saveQuestion}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button 
                  onClick={() => setEditingQuestion(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Display View
            <div>
              <p className="font-bold">{question.text}</p>
              <p>Type: {question.type}</p>
              <div>
                <strong>Options:</strong>
                <ul>
                  {question.options.map((option, optionIndex) => (
                    <li 
                      key={optionIndex}
                      className={question.correct_answers.includes(optionIndex) 
                        ? 'text-green-600' 
                        : ''
                      }
                    >
                      {option} 
                      {question.correct_answers.includes(optionIndex) && ' (Correct)'}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-2 mt-4">
                <button 
                  onClick={() => startEditing(question)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteQuestion(question.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4 text-white flex justify-center space-x-4">
          <Link to="/" className="hover:underline">Create Question</Link>
          <Link to="/test" className="hover:underline">Take Test</Link>
          <Link to="/manage" className="hover:underline">Manage Questions</Link>
        </nav>
        <Routes>
          <Route path="/" element={<CreateQuestionPage />} />
          <Route path="/test" element={<TestModePage />} />
          <Route path="/manage" element={<QuestionManagementPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
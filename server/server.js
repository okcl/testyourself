const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = new sqlite3.Database('./quiz.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  }
  console.log('Connected to the quiz database.');
});

// Initialize Database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    type TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answers TEXT NOT NULL
  )`);
});

// Create Question
app.post('/api/questions', (req, res) => {
  const { text, type, options, correctAnswers } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO questions (text, type, options, correct_answers) 
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(
    text, 
    type, 
    JSON.stringify(options), 
    JSON.stringify(correctAnswers),
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
  
  stmt.finalize();
});

// Update Question
app.put('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const { text, type, options, correctAnswers } = req.body;
  
  const stmt = db.prepare(`
    UPDATE questions 
    SET text = ?, type = ?, options = ?, correct_answers = ?
    WHERE id = ?
  `);
  
  stmt.run(
    text, 
    type, 
    JSON.stringify(options), 
    JSON.stringify(correctAnswers),
    id,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Check if any rows were actually updated
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      res.json({ message: 'Question updated successfully', changes: this.changes });
    }
  );
  
  stmt.finalize();
});

// Get All Questions
app.get('/api/questions', (req, res) => {
  db.all(`SELECT * FROM questions`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const processedRows = rows.map(row => ({
      ...row,
      options: JSON.parse(row.options),
      correct_answers: JSON.parse(row.correct_answers)
    }));
    res.json(processedRows);
  });
});

// Delete Question
app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM questions WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Check if any rows were actually deleted
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully', changes: this.changes });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});
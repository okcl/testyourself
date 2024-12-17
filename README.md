Here's an updated `README.md` tailored to the structure of your project:

---

# Quiz App

A full-stack quiz app with a React frontend and Node.js backend. The app allows users to take quizzes, view questions and answers, and manage them through the backend.

## Features

- **Frontend (React):**
  - Display and take quizzes
  - User-friendly interface with question navigation

- **Backend (Node.js & SQLite):**
  - Fetch quiz questions from the database
  - Manage quiz data (add, retrieve, etc.)

## Requirements

Before running the app, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Recommended version: 16.x or higher)
- [npm](https://www.npmjs.com/) (npm comes with Node.js)

## Getting Started

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/okcl/testyourself.git
```

### 2. Navigate into the Project Directory

```bash
cd testyourself
```

### 3. Install Dependencies

#### For the client (React frontend):

Navigate to the `client` directory and install dependencies:

```bash
cd client
npm install
```

#### For the server (Node.js backend):

Navigate to the `server` directory and install dependencies:

```bash
cd ../server
npm install
```

### 4. Start the Backend Server

Once you’ve set up the backend, you can start the Node.js server. It will automatically generate the `quiz.db` file.

```bash
npm start
```

This will run the server on `http://localhost:5000`. You can now interact with the API endpoints to create and fetch tests.

The server will run on `http://localhost:5000` by default.

### 5. Start the Frontend

Now, start the frontend from the `client` directory:

```bash
cd ../client
npm start
```

The frontend will be available at `http://localhost:3000`.

### 6. Open the App in Your Browser

Once both the server and client are running, open your browser and go to:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Project Structure

```
testyourself/
  ├── client/               # React frontend
  │   ├── public/           # Public assets like index.html
  │   └── src/              # React source files
  │       ├── components/   # React components (e.g., Quiz, Question, etc.)
  │       ├── App.js        # Main React app file
  │       └── index.js      # React entry point
  ├── server/               # Node.js backend
  │   ├── database.js       # SQLite database initialization
  │   ├── server.js         # Express server setup
  │   └── quiz.db           # SQLite database with quiz data
  ├── package.json          # Project dependencies
  └── README.md             # This file
```

## Available Scripts

### For the Client (React):

- `npm start`: Runs the app in development mode (Frontend).
- `npm run build`: Builds the app for production.

### For the Server (Node.js):

- `npm start`: Runs the server in development mode (Backend).
  
## Troubleshooting

- If the frontend is not displaying correctly, ensure the server is running.
- If you encounter any issues with the database, check the `quiz.db` file and verify the SQLite setup.

---
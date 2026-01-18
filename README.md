# Dice Game - Odd or Even

A full-stack dice game where players can bet on whether the dice roll will be odd or even.

## Features

- 🎲 Dice rolling game (Odd/Even prediction)
- 💰 Bet management system
- 👀 Watch mode for non-paying users
- 🔐 User authentication and authorization
- 📊 Game statistics and history

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure MongoDB is running locally

3. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

4. Open `public/index.html` in your browser or access via `http://localhost:5000`

## Game Rules

- Login to play or use watch mode for free
- Guess whether the dice will land on odd or even
- Win doubles your bet amount
- Track your game statistics

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Authentication**: JWT tokens
- **Security**: bcrypt password hashing

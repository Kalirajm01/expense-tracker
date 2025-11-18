# Expense Tracker

## Overview

A simple Expense Tracker application built with Flask for the backend, React for the frontend, and PostgreSQL for the database. This app allows users to track their expenses without requiring any authentication.

## Features

- Add, view, and delete expenses
- Categorize expenses for better organization
- Responsive design for various devices
- Real-time expense tracking with date and description

## Tech Stack

- **Backend**: Flask
- **Frontend**: React
- **Database**: PostgreSQL

## Installation and Setup

### Prerequisites

- Python 3.4
- Node.js and npm
- PostgreSQL

### Steps

1. Clone the repository:

   ```
   git clone https://github.com/Kalirajm01/expense-tracker
   cd expense-tracker
   ```

2. Set up the PostgreSQL database:

   - Create a database named `expense_tracker`
   - Run the SQL scripts to create the tables (see Database Schema section)

3. Backend setup:

   - Navigate to the backend directory (if separate)
   - Install dependencies: `pip install flask psycopg2`
   - Configure database connection in your Flask app
   - Run the backend: `python app.py`

4. Frontend setup:

   - Navigate to the frontend directory
   - Install dependencies: `npm install`
   - Start the development server: `npm start`

5. Access the app at `http://localhost:3000` (frontend) and ensure the backend is running on its configured port.

## Usage

- **Adding Expenses**: Enter the amount, description, date, and select a category to add a new expense.
- **Viewing Expenses**: Browse the list of expenses with filtering options.
- **Deleting**: Remove existing expenses as needed.

## Database Schema

The application uses two main tables in the `expense_tracker` database:

### expenses

- `id` (integer, primary key, auto-increment)
- `amount` (decimal/float)
- `description` (text)
- `date` (date)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `category_id` (integer, foreign key to categories.id)

### categories

- `id` (integer, primary key, auto-increment)
- `name` (varchar/text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Themes & Colors

### Color Palette

- Primary: `#3498db` (Blue)
- Secondary: `#2ecc71` (Green)
- Accent: `#e74c3c` (Red)
- Background: `#f8f9fa` (Light Gray)
- Text: `#2c3e50` (Dark Blue)
- Success: `#27ae60` (Green)
- Warning: `#f39c12` (Orange)
- Danger: `#e74c3c` (Red)

### Themes

1. **Light Theme**

   - Background: `#ffffff`
   - Text: `#2c3e50`
   - Primary: `#3498db`

## Project Structure

```
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Main page components
|   ├── services/       # API Services
├── backend/            # Flask application
├── test/   
└── README.md
```

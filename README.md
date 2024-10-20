# Rule Engine Project

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
  - [Creating and Modifying Rules](#creating-and-modifying-rules)
  - [Combining Rules](#combining-rules)
  - [Evaluating Rules](#evaluating-rules)
  - [AST Visualization](#ast-visualization)

## Overview

The **Rule Engine Project** is a full-stack application designed to allow users to create, modify, combine, and evaluate business rules based on user-defined conditions and functions. It provides a visual representation of the rules' Abstract Syntax Trees (AST) using `react-d3-tree`, enabling users to understand and manage complex rule structures effectively.

## Features

- **Create and Modify Rules:** Define custom rules using a combination of attributes and logical operators.
- **Combine Rules:** Merge multiple rules into a single composite rule using logical operators like AND/OR.
- **Evaluate Rules:** Assess user data against all defined rules to determine eligibility or compliance.
- **AST Visualization:** Visualize the structure of rules through an interactive tree diagram, aiding in comprehension and debugging.
- **Manage Rules:** View, delete, and organize existing rules seamlessly.
- **Responsive UI:** User-friendly interface built with React, ensuring accessibility across devices.

## Deployment
Vercel Link: [Link](https://rule-engine-frontend-sandy.vercel.app/)


## Screenshots

![image](https://github.com/user-attachments/assets/6df74909-6a3c-4310-9489-188d72c92926)


## Technology Stack

- **Frontend:**
  - React
  - Axios
  - react-d3-tree
  - react-icons
  - CSS

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - CORS
  - dotenv

- **Deployment:**
  - Vercel

## Architecture

The application follows a client-server architecture:

- **Frontend (React):** Handles user interactions, displays the UI, and communicates with the backend via API calls.
- **Backend (Node.js/Express):** Manages business logic, processes rule definitions, evaluates rules against user data, and interacts with the MongoDB database.
- **Database (MongoDB):** Stores rules, their AST representations, and user-defined functions for persistence.

## Installation

### Prerequisites

- **Node.js & npm:** Ensure you have Node.js and npm installed. You can download them from [here](https://nodejs.org/).
- **MongoDB:** A running instance of MongoDB. You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a cloud-based solution or install it locally.

### Backend Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/rule-engine-project.git
   cd rule-engine-project/backend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   - Create a `.env` file in the `backend` directory:

     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     ALLOWED_ORIGIN=http://localhost:3000
     ```

     - **`PORT`**: Port on which the backend server will run.
     - **`MONGO_URI`**: Your MongoDB connection string.
     - **`ALLOWED_ORIGIN`**: URL of your frontend application for CORS configuration.

4. **Run the Backend Server:**

   ```bash
   npm start
   ```

   - The server should start on `http://localhost:5000` and connect to MongoDB.

### Frontend Setup

1. **Navigate to Frontend Directory:**

   ```bash
   cd ../frontend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   - Create a `.env` file in the `frontend` directory:

     ```env
     REACT_APP_API=http://localhost:5000
     ```

     - **`REACT_APP_API`**: URL of your backend API.

4. **Run the Frontend Application:**

   ```bash
   npm start
   ```

   - The application should open in your default browser at `http://localhost:3000`.

## Environment Variables

Ensure that both frontend and backend have their respective environment variables correctly set.

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ALLOWED_ORIGIN=http://localhost:3000
```

### Frontend `.env`

```env
REACT_APP_API=http://localhost:5000
```

- **Note:** Replace `http://localhost:5000` with your deployed backend URL when moving to production.

## Running the Application

1. **Start Backend Server:**

   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Application:**

   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application:**

   - Open your browser and navigate to `http://localhost:3000`.

## API Endpoints

### **Rule Management**

- **Create Rule**

  - **URL:** `/api/rules/create`
  - **Method:** `POST`
  - **Body:**
    ```json
    {
      "ruleName": "RuleName",
      "ruleString": "age > 30 AND department = \"Sales\""
    }
    ```
  - **Response:** Created rule object.

- **Modify Rule**

  - **URL:** `/api/rules/modify`
  - **Method:** `POST`
  - **Body:**
    ```json
    {
      "ruleName": "RuleName",
      "ruleString": "age > 40 AND department = \"Marketing\""
    }
    ```
  - **Response:** Updated rule object.

- **Combine Rules**

  - **URL:** `/api/rules/combine`
  - **Method:** `POST`
  - **Body:**
    ```json
    {
      "ruleNames": ["Rule1", "Rule2"]
    }
    ```
  - **Response:** Combined rule object.

- **Evaluate All Rules**

  - **URL:** `/api/rules/evaluateAll`
  - **Method:** `POST`
  - **Body:**
    ```json
    {
      "userData": {
        "age": 35,
        "department": "Sales",
        "salary": 60000,
        "experience": 8,
        "spend": 3000
      }
    }
    ```
  - **Response:** Evaluation results indicating eligibility.

- **Get All Rules**

  - **URL:** `/api/rules/`
  - **Method:** `GET`
  - **Response:** List of all rule names.

- **Get Specific Rule**

  - **URL:** `/api/rules/:ruleName`
  - **Method:** `GET`
  - **Response:** Rule object with AST.

- **Delete Rule**

  - **URL:** `/api/rules/:ruleName`
  - **Method:** `DELETE`
  - **Response:** Success message.

### **User-Defined Functions**

- **Add Function**

  - **URL:** `/api/rules/addFunction`
  - **Method:** `POST`
  - **Body:**
    ```json
    {
      "name": "isSeniorEmployee",
      "body": "return data.age > 50 && data.experience > 10;"
    }
    ```
  - **Response:** Success message.

## Usage

### Creating and Modifying Rules

1. **Navigate to "Create/Modify Rule":**
   - Enter a unique rule name.
   - Define the rule string using valid attributes and logical operators (e.g., `age > 30 AND department = "Sales"`).
   - Click **"Create Rule"** or **"Modify Rule"** based on the action.

2. **Validation:**
   - The backend validates the rule structure and ensures that all attributes and operators are valid.
   - If a user-defined function is used, it must be previously defined.

### Combining Rules

1. **Navigate to "Combine Rules":**
   - Select at least two rules by checking their respective checkboxes.
   - Click **"Combine Selected Rules"**.
   - A new combined rule will be created, merging the selected rules using the OR operator.

### Evaluating Rules

1. **Navigate to "Evaluate Rules":**
   - Input user data into the provided fields (Age, Department, Salary, Experience, Spend).
   - Click **"Evaluate Rules"**.
   - The application evaluates the input data against all defined rules and displays the eligibility result.

### AST Visualization

1. **Navigate to "AST Visualization":**
   - In the "Existing Rules" section, click on a rule name.
   - The AST of the selected rule will be displayed as an interactive tree diagram.
   - Nodes represent operators and operands, providing a clear structural view of the rule.

## Troubleshooting

### Common Issues

1. **CORS Policy Errors:**
   - **Symptom:** `No 'Access-Control-Allow-Origin' header is present on the requested resource.`
   - **Solution:**
     - Ensure backend CORS is configured to allow requests from your frontend's origin.
     - Verify that the frontend is using the correct backend API URL without typos.

2. **Failed to Fetch Rules:**
   - **Symptom:** Error message indicating failure to fetch rules.
   - **Solution:**
     - Check for typographical errors in API request URLs.
     - Ensure the backend server is running and accessible.
     - Verify environment variables are correctly set.
     - Inspect network requests using browser developer tools for more details.

3. **Invalid AST Structure:**
   - **Symptom:** Errors related to AST parsing or visualization.
   - **Solution:**
     - Ensure that the backend correctly constructs and validates the AST.
     - Verify that user-defined functions are properly recognized and integrated into the AST.
     - Check frontend logs for any discrepancies in AST data received.

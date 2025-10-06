# Quiz-API_verto
A simple and modular Quiz Management API built with Node.js, Express, and TypeScript. This backend allows users to create quizzes, add questions, retrieve quiz data, and submit answers to calculate scores.


# 🧠 Quiz API

A simple and modular **Quiz Management API** built with **Node.js**, **Express**, and **TypeScript**.  
This backend allows users to create quizzes, add questions, retrieve quiz data, and submit answers to calculate scores.  
The data is stored **in-memory** for simplicity — ideal for demos, prototypes, or learning purposes.

----------

## ⚙️ Setup & Run Locally

### 1. Clone the Repository

```
git clone https://github.com/OmkarHalpatrao/Verto-Quiz-APIgit
cd Quiz-API_verto 
```
### 2. Install Dependencies

```
npm install
```

### 3. Start the Server

```
npm run dev
``` 

The server will start at:

```http://localhost:4000``` 

----------

## 🧪 Running Tests

To run your test cases (for example, using **Jest**):

1.  **Install Jest (if not installed)**
    
    ```
    npm install --save-dev jest @types/jest ts-jest
    ```
    
2.  **Initialize Jest Config**
    
    ```
    npx ts-jest config:init
    ```
    
3.  **Run Tests**
    
    ```
    npm test
    ```
    

You can place your test files in a `/tests` directory with the naming convention:

```
quizService.test.ts
quizController.test.ts
```

----------

## 💡 Assumptions & Design Choices

### 🗃 In-memory data store

No database is used — all quizzes, questions, and scores exist in memory for simplicity.

### ✅ Validation-first design

All payloads are validated with **Zod** to ensure data integrity before processing.

### 🧱 Clean modular structure

-   `/model` → Type definitions
    
-   `/services` → Core business logic
    
-   `/controllers` → Request handling
    
-   `/routes` → Endpoint routing
    
-   `/utils` → Validation & helpers
    

### 🔍 Fuzzy matching

For text answers, fuzzy matching (via **fast-fuzzy**) allows minor typos to still receive credit.

### 🌐 RESTful structure

All endpoints follow REST standards for predictable and consistent API behavior.

----------

## 🧾 Example Request

### 📝 Create a Quiz

```
POST http://localhost:4000/quizzes
Content-Type: application/json

{
  "title": "GK-Quiz"
}
```

### ➕ Add Questions

`POST http://localhost:4000/quizzes/:quizId/questions
Content-Type: application/json

```
{
  "questions": [
    {
      "text": "What is the capital of India?",
      "type": "single_choice",
      "options": [
        { "text": "Mumbai"},
        { "text": "New Delhi", "isCorrect": true},
        { "text": "Kolkata"}
      ]
    },
    {
      "text": "Select prime numbers",
      "type": "single_choice",
      "options": [
        { "text": "2", "isCorrect": true },
        { "text": "3", "isCorrect": false },
        { "text": "4", "isCorrect": false },
        { "text": "5", "isCorrect": false }
      ]
    },
    {
      "text": "Name the largest planet in our solar system",
      "type": "text",
      "options": [],
      "correctAnswer": "Jupiter"
    }
  ]
}

```
### 🧩 Get All Quizzes
```
GET http://localhost:4000/quizzes/all-quiz
```
### ❓ Get Questions for a Quiz
```
GET http://localhost:4000/quizzes/:quizId/questions
```


### 🧮 Submit Answers


```
POST http://localhost:4000/quizzes/:quizId/submit
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionIds": [2]  // New Delhi
    },
    {
      "questionId": 2,
      "selectedOptionIds": [1,2,4]  // 2, 3, 5
    },
    {
      "questionId": 3,
      "textAnswer": "Jupiter"  
    }
  ]
}
 

### ✅ Response

`{  "score":  2,  "total":  2  }
```

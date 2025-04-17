# 🩺 TeamZenith HealthCare App

The **TeamZenith HealthCare App** is a cross-platform mobile health assistant that guides users through symptom-based questionnaires, predicts potential diseases using AI, and generates medical reports. It’s built with **React Native (Expo)** and powered by a **Flask backend**.

---

## 🧠 Key Features

- ✅ Symptom-based interactive diagnosis  
- 📄 Auto-generated downloadable health reports (DOCX)  
- 🔒 Firebase Firestore for storing user data securely  
- 📱 Clean and responsive user interface  
- ⚙️ Smart backend logic for dynamic question generation  

---

## 📲 Screenshots

| Home Screen | Questionnaire | Prediction Result | PDF or Docx Report |
|-------------|----------------|--------------------|--------------------|
| ![Home](./assets/images/screenshot-home.png) | ![Questions](./assets/images/screenshot-questions.png) | ![Prediction](./assets/images/screenshot-result.png) |![PDF](./assets/images/PDForDocx(1).png) |
| ![Home](./assets/images/screenshot-home(2).png) | ![Questions](./assets/images/screenshot-questions(2).png) |  ![Prediction](./assets/images/screenshot-result(3).png) | ![PDF](./assets/images/PDForDocx(2).png) |

> 📷 

---

## 👤 User Instructions

Here’s how a user interacts with the app:

1. **Open the App**  
   Launch the app using Expo Go or an emulator.

2. **Provide Initial Information**  
   Enter basic health metrics (height, weight, etc.) and initial symptoms.

3. **Answer Follow-Up Questions**  
   The app will ask dynamic follow-up questions based on the symptoms you selected.

4. **Receive Prediction**  
   After answering all questions, the app will send your responses to a Flask backend to predict a possible disease.

5. **Download Report**  
   You’ll get a downloadable `.docx` file containing the prediction summary and recommendations.

---

## 🔧 Tech Stack

- **Frontend:** React Native (Expo), JavaScript 
- **Backend:** Flask (Python)  
- **Database:** Firebase Firestore, Appwrite 
- **Report Gen:** Python-docx & PDF 

---

## 📁 Project Structure

```bash
TeamZenith-prac/
├── app/              # Main app screens and logic
│   ├── screens/      # Individual screen components (e.g. Home, Result, etc.)
│   ├── navigation/   # Navigation stack and config
│   └── index.tsx     # Entry point for the app
├── components/       # Reusable UI components (e.g. Button, Card, etc.)
├── constants/        # App-wide constants, themes, and configs
├── context/          # Context API providers for global state
├── lib/              # Utility functions (e.g. API calls, helpers)
├── assets/           # Static assets like images, fonts, etc.
├── firebase/         # Firebase configuration and Firestore setup
├── app.json          # Expo app configuration
├── eas.json          # Expo Application Services config
├── package.json      # Project metadata and dependencies
├── tsconfig.json     # TypeScript configuration
└── README.md         # Project documentation (this file)
```


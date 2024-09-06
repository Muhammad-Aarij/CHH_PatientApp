// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import Firebase auth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChAGHcNxVQ7jCV4-9zGH1L32xTJcj-dKg",
  authDomain: "cardio-f3e64.firebaseapp.com",
  projectId: "cardio-f3e64",
  storageBucket: "cardio-f3e64.appspot.com",
  messagingSenderId: "543638142387",
  appId: "1:543638142387:web:79f1e7bb2b9138d6641fc6",
  measurementId: "G-F06Y3Q29JX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth so that it can be used in other components
export const auth = getAuth(app);

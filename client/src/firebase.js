// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "bhagwat-estate.firebaseapp.com",
  projectId: "bhagwat-estate",
  storageBucket: "bhagwat-estate.appspot.com",
  messagingSenderId: "442650265458",
  appId: "1:442650265458:web:e8282959fc0753f8c87feb"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// src/lib/firebase.js - Initialize Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCtHqEuAZatLYl8y_HMhXdH4ssJ1z5eXOA",
    authDomain: "crimsonapollogpt.firebaseapp.com",
    projectId: "crimsonapollogpt",
    storageBucket: "crimsonapollogpt.firebasestorage.app",
    messagingSenderId: "736518762560",
    appId: "1:736518762560:web:d48a9b92455d5ea4b8efa5",
    measurementId: "G-WTD93EJJ8X"
  };

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

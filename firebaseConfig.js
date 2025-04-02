// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getReactNativePersistence, initializeAuth} from 'firebase/auth'
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore, collection} from 'firebase/firestore'
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDguwuXftPWvYysPN4qlQCJxfJ0d-baRQA",
  authDomain: "app-nocturnal.firebaseapp.com",
  projectId: "app-nocturnal",
  storageBucket: "app-nocturnal.firebasestorage.app",
  messagingSenderId: "164031274488",
  appId: "1:164031274488:web:d190767346094db082ca0d",
  measurementId: "G-2494L7349T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');

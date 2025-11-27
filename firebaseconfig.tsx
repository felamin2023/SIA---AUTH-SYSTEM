import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyCQI6FM7AptajLgWn1V1OxrvU-S9HUjchU",
    authDomain: "sia-fe582.firebaseapp.com",
    projectId: "sia-fe582",
    storageBucket: "sia-fe582.firebasestorage.app",
    messagingSenderId: "381952914806",
    appId: "1:381952914806:web:2b45b4777d8c830db33657"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);



export { app, db, auth };

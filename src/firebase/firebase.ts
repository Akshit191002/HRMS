import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCPPb4A72yGSyyKMUT0FP-93dRZSXi0Rs",
  authDomain: "hrms-293ab.firebaseapp.com",
  projectId: "hrms-293ab",
  storageBucket: "hrms-293ab.firebasestorage.app",
  messagingSenderId: "17513766465",
  appId: "1:17513766465:web:7778f8387657049fd530c0",
  measurementId: "G-6WB390TFZ6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db }
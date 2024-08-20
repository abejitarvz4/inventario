import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqT3wjvLBrRwxWs-jkMoq6Qvb2AUoV3SI",
  authDomain: "inventarioez.firebaseapp.com",
  projectId: "inventarioez",
  storageBucket: "inventarioez.appspot.com",
  messagingSenderId: "715527922450",
  appId: "1:715527922450:web:6a10cdda1ac308e14049cb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

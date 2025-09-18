import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3rGsJY8qctQcJmP9SgbZKmvlB5weY3Zg",
  authDomain: "goproverbs-2b36f.firebaseapp.com",
  projectId: "goproverbs-2b36f",
  storageBucket: "goproverbs-2b36f.appspot.com",
  messagingSenderId: "385016430720",
  appId: "1:385016430720:web:6e1c9aa62fdb0ed1b06665",
  measurementId: "G-4B0N16LNSM"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development') {
  console.log("Development mode: Connecting to Firebase emulators.");
  // Point to the emulators
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

// Initialize Analytics if running in the browser
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  getAnalytics(app);
}

export { app, db, auth, storage };

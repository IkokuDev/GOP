import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";
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
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development') {
  console.log("Development mode: Connecting to Firebase emulators.");
  
  // Initialize services and connect to emulators
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);

} else {
  // Initialize services for production
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  // Initialize Analytics if running in the browser and in production
  if (typeof window !== 'undefined') {
    getAnalytics(app);
  }
}

export { app, db, auth, storage };

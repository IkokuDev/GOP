import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "emulator-api-key", // Use a placeholder for emulators
  authDomain: "goproverbs-2b36f.firebaseapp.com",
  projectId: "goproverbs-2b36f",
  storageBucket: "goproverbs-2b36f.appspot.com",
  messagingSenderId: "385016430720",
  appId: "1:385016430720:web:6e1c9aa62fdb0ed1b06665",
  measurementId: "G-4B0N16LNSM"
};


// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development') {
  console.log("Development mode: Connecting to Firebase emulators.");
  
  // Before connecting, make sure to check if the emulator is already connected
  // This is a safeguard against hot-reloads re-running this code.
  // The _isEmulator check is an internal property, but it's the most reliable way.
  // @ts-ignore
  if (!auth.emulatorConfig) {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  }
  // @ts-ignore
  if (!db._isEmulator) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  // @ts-ignore
  if (!storage._isEmulator) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }

} else {
  // Initialize Analytics if running in the browser and in production
  if (typeof window !== 'undefined') {
    isSupported().then(supported => {
      if (supported) {
        getAnalytics(app);
      }
    });
  }
}

export { app, db, auth, storage };

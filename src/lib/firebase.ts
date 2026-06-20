import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if configuration is available
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
}

/**
 * Saves UserProfile to Firebase Firestore if configured.
 * Otherwise, logs locally.
 */
export async function syncProfileToFirebase(profile: any): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    console.log("Firebase not configured. Profile sync simulated locally.");
    return false;
  }

  try {
    const userId = profile.name 
      ? encodeURIComponent(profile.name.toLowerCase().replace(/\s+/g, "_")) 
      : "default_user";
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log("Profile synced to Firestore successfully.");
    return true;
  } catch (error) {
    console.error("Firestore sync error:", error);
    return false;
  }
}

/**
 * Loads UserProfile from Firebase Firestore if configured.
 */
export async function loadProfileFromFirebase(userName: string): Promise<any | null> {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  try {
    const userId = encodeURIComponent(userName.toLowerCase().replace(/\s+/g, "_"));
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Firestore load error:", error);
    return null;
  }
}

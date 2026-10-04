// Sets up Firebase and exposes small helper functions the rest of the
// site uses to read "hobbies" and write "messages" to Firestore.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

let db = null;
let firebaseReady = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  firebaseReady = firebaseConfig.apiKey !== "YOUR_API_KEY";
} catch (err) {
  console.warn("Firebase did not initialize:", err);
}

/**
 * Reads all documents from the "hobbies" collection, ordered by an
 * "order" number field. Each doc: { title, description, image, order }.
 * Returns [] if Firebase isn't configured yet or the read fails.
 */
export async function fetchHobbies() {
  if (!firebaseReady || !db) return [];
  try {
    const q = query(collection(db, "hobbies"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Could not load hobbies from Firestore:", err);
    return [];
  }
}

/**
 * Writes a visitor's contact form submission to the "messages" collection.
 * Throws if Firebase isn't configured or the write fails, so the caller
 * can show an error state.
 */
export async function submitMessage({ name, email, message }) {
  if (!firebaseReady || !db) {
    throw new Error("Firebase is not configured yet.");
  }
  return addDoc(collection(db, "messages"), {
    name,
    email,
    message,
    createdAt: serverTimestamp()
  });
}

export { firebaseReady };

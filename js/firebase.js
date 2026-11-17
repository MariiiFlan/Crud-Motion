import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getState, setState, subscribe } from "./helpers.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLJUg7i5bCSd8O32W1yc6THM5f0mT-uW0",
  authDomain: "crudmotion-13f17.firebaseapp.com",
  projectId: "crudmotion-13f17",
  storageBucket: "crudmotion-13f17.firebasestorage.app",
  messagingSenderId: "694644529759",
  appId: "1:694644529759:web:78a7bae0ac9760d6d2d9ea",
  measurementId: "G-R5YF50X4KX"
};

const AUTH_ERRORS = {
  "auth/invalid-email": "That email doesn't look right.",
  "auth/missing-password": "Enter a password.",
  "auth/weak-password": "Password needs at least 6 characters.",
  "auth/email-already-in-use": "That email already has an account. Log in instead.",
  "auth/invalid-credential": "Email or password is wrong.",
  "auth/user-not-found": "Email or password is wrong.",
  "auth/wrong-password": "Email or password is wrong.",
  "auth/too-many-requests": "Too many tries. Wait a minute and try again.",
  "auth/network-request-failed": "No connection. Check your internet."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function friendlyAuthError(error) {
  return AUTH_ERRORS[error.code] || "Something went wrong. Try again.";
}

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logOut() {
  return signOut(auth);
}

function expensesRef() {
  const user = getState().user;
  if (!user) throw new Error("not-signed-in");
  return collection(db, "users", user.uid, "expenses");
}

export function addExpense(expense) {
  return addDoc(expensesRef(), { ...expense, createdAt: serverTimestamp() });
}

export function updateExpense(id, changes) {
  return updateDoc(doc(expensesRef(), id), changes);
}

export function removeExpense(id) {
  return deleteDoc(doc(expensesRef(), id));
}

export function startFirebase() {
  let stopListening = null;
  let listeningFor = null;

  onAuthStateChanged(auth, (user) => setState({ user }));

  subscribe(({ user }) => {
    const uid = user ? user.uid : null;
    if (uid === listeningFor) return;
    listeningFor = uid;
    if (stopListening) stopListening();
    stopListening = null;
    if (!uid) {
      setState({ expenses: [] });
      return;
    }
    stopListening = onSnapshot(query(expensesRef(), orderBy("date", "desc")), (snap) => {
      setState({ expenses: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
    });
  });
}

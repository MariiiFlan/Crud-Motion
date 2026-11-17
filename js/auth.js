import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";
import { setState } from "./state.js";

const ERROR_MESSAGES = {
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

export function friendlyAuthError(error) {
  return ERROR_MESSAGES[error.code] || "Something went wrong. Try again.";
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

export function watchAuth() {
  onAuthStateChanged(auth, (user) => setState({ user }));
}

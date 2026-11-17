import {
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
import { db } from "./firebase.js";
import { getState, setState, subscribe } from "./state.js";

let stopListening = null;
let listeningFor = null;

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

export function startExpenseSync() {
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
    const q = query(expensesRef(), orderBy("date", "desc"));
    stopListening = onSnapshot(q, (snap) => {
      setState({ expenses: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
    });
  });
}

import { signUp, logIn, logOut, friendlyAuthError } from "./auth.js";
import { subscribe } from "./state.js";

let mode = "login";
let dialog, form, title, submit, switchText, switchBtn, errorBox, authBtn, userLabel;

function setMode(next) {
  mode = next;
  const isLogin = mode === "login";
  title.textContent = isLogin ? "Log in" : "Create account";
  submit.textContent = isLogin ? "Log in" : "Sign up";
  switchText.textContent = isLogin ? "No account yet?" : "Already have an account?";
  switchBtn.textContent = isLogin ? "Sign up" : "Log in";
  form.password.autocomplete = isLogin ? "current-password" : "new-password";
  errorBox.textContent = "";
}

export function openAuthModal(next = "login") {
  form.reset();
  setMode(next);
  dialog.showModal();
  form.email.focus();
}

export function initAuthModal() {
  dialog = document.querySelector(".auth-dialog");
  form = dialog.querySelector(".auth-form");
  title = dialog.querySelector(".auth-title");
  submit = dialog.querySelector(".auth-submit");
  switchText = dialog.querySelector(".auth-switch-text");
  switchBtn = dialog.querySelector(".auth-switch");
  errorBox = dialog.querySelector(".auth-error");
  authBtn = document.querySelector(".auth-button");
  userLabel = document.querySelector(".user-label");

  switchBtn.addEventListener("click", () => setMode(mode === "login" ? "signup" : "login"));
  dialog.querySelector(".auth-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";
    submit.disabled = true;
    try {
      const email = form.email.value.trim();
      const password = form.password.value;
      if (mode === "login") await logIn(email, password);
      else await signUp(email, password);
      dialog.close();
    } catch (err) {
      errorBox.textContent = friendlyAuthError(err);
    } finally {
      submit.disabled = false;
    }
  });

  authBtn.addEventListener("click", () => {
    if (authBtn.dataset.state === "in") logOut();
    else openAuthModal("login");
  });

  subscribe(({ user }) => {
    const signedIn = Boolean(user);
    authBtn.dataset.state = signedIn ? "in" : "out";
    authBtn.textContent = signedIn ? "Log out" : "Log in";
    userLabel.textContent = signedIn ? user.email : "";
    userLabel.hidden = !signedIn;
  });
}

import { signUp, logIn, logOut, friendlyAuthError, addExpense, startFirebase } from "./firebase.js";
import { CATEGORIES, getState, setState, subscribe, money, todayString, monthKey, shortDate } from "./helpers.js";

const ADDED_FLASH_MS = 1400;

const categoryOptions = () => CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("");

function initHeader() {
  const search = document.querySelector(".search");
  const select = document.querySelector(".category-select");

  select.innerHTML = '<option value="all">All categories</option>' + categoryOptions();

  search.addEventListener("input", () => setState({ search: search.value.trim().toLowerCase() }));
  select.addEventListener("change", () => setState({ category: select.value }));
}

let openAuthModal = () => {};

function initAuthModal() {
  const dialog = document.querySelector(".auth-dialog");
  const form = dialog.querySelector(".auth-form");
  const title = dialog.querySelector(".auth-title");
  const submit = dialog.querySelector(".auth-submit");
  const switchText = dialog.querySelector(".auth-switch-text");
  const switchBtn = dialog.querySelector(".auth-switch");
  const errorBox = dialog.querySelector(".auth-error");
  const authBtn = document.querySelector(".auth-button");
  const userLabel = document.querySelector(".user-label");
  let mode = "login";

  const setMode = (next) => {
    mode = next;
    const isLogin = mode === "login";
    title.textContent = isLogin ? "Log in" : "Create account";
    submit.textContent = isLogin ? "Log in" : "Sign up";
    switchText.textContent = isLogin ? "No account yet?" : "Already have an account?";
    switchBtn.textContent = isLogin ? "Sign up" : "Log in";
    form.password.autocomplete = isLogin ? "current-password" : "new-password";
    errorBox.textContent = "";
  };

  openAuthModal = (next = "login") => {
    form.reset();
    setMode(next);
    dialog.showModal();
    form.email.focus();
  };

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

function initExpenseForm() {
  const form = document.querySelector(".expense-form");
  const button = form.querySelector(".add-button");
  const status = form.querySelector(".form-status");

  const setError = (name, message) => {
    const field = form.querySelector(`[name="${name}"]`);
    const box = form.querySelector(`[data-error-for="${name}"]`);
    field.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", message ? "true" : "false");
    box.textContent = message || "";
  };

  const validate = () => {
    const amount = parseFloat(form.amount.value);
    const merchant = form.merchant.value.trim();
    const date = form.date.value;
    const errors = {
      amount: !(amount > 0) ? "Enter an amount above 0" : "",
      merchant: !merchant ? "Where did you spend it?" : "",
      date: !date ? "Pick a date" : ""
    };
    Object.entries(errors).forEach(([name, msg]) => setError(name, msg));
    if (Object.values(errors).some(Boolean)) return null;
    return {
      amount: Math.round(amount * 100) / 100,
      category: form.category.value,
      merchant,
      date,
      note: form.note.value.trim()
    };
  };

  form.category.innerHTML = categoryOptions();
  form.date.value = todayString();

  ["amount", "merchant", "date"].forEach((name) => {
    form[name].addEventListener("input", () => setError(name, ""));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const expense = validate();
    if (!expense) return;
    if (!getState().user) {
      openAuthModal("login");
      return;
    }
    button.disabled = true;
    status.textContent = "";
    try {
      await addExpense(expense);
      const keepCategory = form.category.value;
      form.reset();
      form.category.value = keepCategory;
      form.date.value = todayString();
      button.textContent = "Added";
      setTimeout(() => { button.textContent = "Add expense"; }, ADDED_FLASH_MS);
      form.amount.focus();
    } catch (err) {
      status.textContent = "Couldn't save that. Try again.";
    } finally {
      button.disabled = false;
    }
  });
}

function initQuickStats() {
  const card = document.querySelector(".stats");
  const el = (sel) => card.querySelector(sel);
  const scope = el(".stats-scope");

  subscribe(({ expenses, category }) => {
    const month = monthKey();
    const list = expenses.filter((e) =>
      e.date && e.date.startsWith(month) && (category === "all" || e.category === category)
    );
    const sum = list.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const top = list.reduce((best, e) => (!best || e.amount > best.amount ? e : best), null);
    const count = list.length;

    scope.textContent = new Date().toLocaleDateString("en-US", { month: "long" }) +
      (category === "all" ? "" : ` · ${category}`);

    el('[data-stat="total"]').textContent = money(sum);
    el('[data-stat-sub="total"]').textContent = count === 1 ? "1 expense" : `${count} expenses`;
    el('[data-stat="biggest"]').textContent = money(top ? top.amount : 0);
    el('[data-stat-sub="biggest"]').textContent = top ? `${top.merchant}, ${shortDate(top.date)}` : "Nothing yet";
    el('[data-stat="average"]').textContent = money(count ? sum / count : 0);
  });
}

initHeader();
initAuthModal();
initExpenseForm();
initQuickStats();
startFirebase();

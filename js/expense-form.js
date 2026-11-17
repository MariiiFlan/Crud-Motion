import { CATEGORIES } from "./categories.js";
import { addExpense } from "./expenses-store.js";
import { getState } from "./state.js";
import { openAuthModal } from "./auth-modal.js";

const ADDED_FLASH_MS = 1400;

function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function setError(form, name, message) {
  const field = form.querySelector(`[name="${name}"]`);
  const box = form.querySelector(`[data-error-for="${name}"]`);
  field.classList.toggle("is-invalid", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
  box.textContent = message || "";
}

function validate(form) {
  const amount = parseFloat(form.amount.value);
  const merchant = form.merchant.value.trim();
  const date = form.date.value;
  const errors = {
    amount: !(amount > 0) ? "Enter an amount above 0" : "",
    merchant: !merchant ? "Where did you spend it?" : "",
    date: !date ? "Pick a date" : ""
  };
  Object.entries(errors).forEach(([name, msg]) => setError(form, name, msg));
  if (Object.values(errors).some(Boolean)) return null;
  return {
    amount: Math.round(amount * 100) / 100,
    category: form.category.value,
    merchant,
    date,
    note: form.note.value.trim()
  };
}

export function initExpenseForm() {
  const form = document.querySelector(".expense-form");
  const button = form.querySelector(".add-button");
  const status = form.querySelector(".form-status");

  form.category.innerHTML = CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("");
  form.date.value = todayString();

  ["amount", "merchant", "date"].forEach((name) => {
    form[name].addEventListener("input", () => setError(form, name, ""));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const expense = validate(form);
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

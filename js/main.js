import { watchAuth } from "./auth.js";
import { startExpenseSync } from "./expenses-store.js";
import { initHeaderControls } from "./header-controls.js";
import { initAuthModal } from "./auth-modal.js";
import { initExpenseForm } from "./expense-form.js";

initHeaderControls();
initAuthModal();
initExpenseForm();
watchAuth();
startExpenseSync();

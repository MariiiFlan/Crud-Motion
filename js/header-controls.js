import { CATEGORIES } from "./categories.js";
import { setState } from "./state.js";

export function initHeaderControls() {
  const search = document.querySelector(".search");
  const select = document.querySelector(".category-select");

  select.innerHTML = '<option value="all">All categories</option>' +
    CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("");

  search.addEventListener("input", () => setState({ search: search.value.trim().toLowerCase() }));
  select.addEventListener("change", () => setState({ category: select.value }));
}

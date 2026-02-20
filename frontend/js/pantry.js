import { api } from "./api.js";

const pantryList = document.getElementById("pantryList");
const addPantryForm = document.getElementById("addPantryForm");

const renderPantry = (items) => {
  pantryList.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "list-group-item text-muted";
    li.textContent = "No pantry items yet.";
    pantryList.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center gap-2";

    const expiresText = item.expiresAt
      ? new Date(item.expiresAt).toLocaleDateString()
      : "N/A";

    li.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="text-muted small">Qty: ${item.quantity ?? 1} | Expires: ${expiresText}</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary" data-action="edit">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete">Delete</button>
      </div>
    `;

    li.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      await api.delete(`/api/pantry/${item.id}`);
      await loadPantry();
      document.dispatchEvent(new Event("pantry:changed"));
    });

    li.querySelector('[data-action="edit"]').addEventListener("click", async () => {
      const name = window.prompt("Item name:", item.name);
      if (!name) return;

      const quantityInput = window.prompt("Quantity:", String(item.quantity ?? 1));
      if (quantityInput === null) return;

      const expiresDefault = item.expiresAt
        ? new Date(item.expiresAt).toISOString().slice(0, 10)
        : "";
      const expiresAt = window.prompt("Expiration date (YYYY-MM-DD) or empty:", expiresDefault);
      if (expiresAt === null) return;

      await api.put(`/api/pantry/${item.id}`, {
        name,
        quantity: Number(quantityInput) || 1,
        expiresAt: expiresAt || null,
      });
      await loadPantry();
      document.dispatchEvent(new Event("pantry:changed"));
    });

    pantryList.appendChild(li);
  });
};

const loadPantry = async () => {
  const items = await api.get("/api/pantry");
  renderPantry(items);
};

addPantryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(addPantryForm);
  const payload = {
    name: formData.get("name"),
    quantity: Number(formData.get("quantity")) || 1,
    expiresAt: formData.get("expiresAt") || null,
  };

  await api.post("/api/pantry", payload);
  addPantryForm.reset();
  await loadPantry();
  document.dispatchEvent(new Event("pantry:changed"));
});

loadPantry();

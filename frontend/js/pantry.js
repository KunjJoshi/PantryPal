import { api } from "./api.js";

const pantryList = document.getElementById("pantryList");

const renderPantry = (items) => {
  pantryList.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = item.name;
    pantryList.appendChild(li);
  });
};

const loadPantry = async () => {
  const items = await api.get("/api/pantry");
  renderPantry(items);
};

loadPantry();

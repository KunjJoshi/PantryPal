import { api } from "./api.js";

const renderHearts = (count, maxHearts) => {
  const full = "\u2665".repeat(count);
  const empty = "\u2661".repeat(Math.max(0, maxHearts - count));
  return `${full}${empty}`;
};

const refreshHealthBars = async () => {
  const healthBars = document.querySelectorAll("[data-health-bar]");
  if (!healthBars.length) return;

  try {
    const health = await api.get("/api/health");
    const text = `Pantry Health: ${renderHearts(
      health.hearts,
      health.maxHearts
    )} (${health.scorePercent}%)`;

    healthBars.forEach((bar) => {
      bar.textContent = text;
    });
  } catch (error) {
    healthBars.forEach((bar) => {
      bar.textContent = "Pantry Health: unavailable";
    });
    console.error("Failed to load pantry health:", error);
  }
};

document.addEventListener("pantry:changed", refreshHealthBars);
document.addEventListener("recipes:changed", refreshHealthBars);

refreshHealthBars();

document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
    });
  }

  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  const swapCards = document.querySelectorAll("[data-swap-image]");

  swapCards.forEach((card) => {
    card.addEventListener("click", function () {
      const img = card.querySelector("img");
      const primary = card.getAttribute("data-primary");
      const alternate = card.getAttribute("data-alternate");
      const primaryAlt = card.getAttribute("data-primary-alt") || "Team member photo";
      const alternateAlt = card.getAttribute("data-alternate-alt") || "Spirit animal illustration";
      const state = card.getAttribute("data-state") || "primary";

      if (!img || !primary || !alternate) return;

      if (state === "primary") {
        img.src = alternate;
        img.alt = alternateAlt;
        card.setAttribute("data-state", "alternate");
      } else {
        img.src = primary;
        img.alt = primaryAlt;
        card.setAttribute("data-state", "primary");
      }
    });

    card.addEventListener("keypress", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });
  });
});

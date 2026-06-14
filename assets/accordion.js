(function () {
  function initAccordions() {
    document.querySelectorAll("[data-accordion]").forEach(function (accordion) {
      if (accordion.dataset.accordionInit) return;
      accordion.dataset.accordionInit = "true";

      const triggers = accordion.querySelectorAll("[data-accordion-trigger]");

      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          const item = trigger.closest("[data-accordion-item]");
          if (!item) return;
          const panel = item.querySelector("[data-accordion-panel]");
          const isOpen = trigger.getAttribute("aria-expanded") === "true";

          if (isOpen) {
            trigger.setAttribute("aria-expanded", "false");
            item.classList.remove("is-open");
            if (panel) panel.style.maxHeight = null;
          } else {
            trigger.setAttribute("aria-expanded", "true");
            item.classList.add("is-open");
            if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });
      });

      // Keep an open panel sized correctly when the viewport changes.
      window.addEventListener("resize", function () {
        accordion.querySelectorAll("[data-accordion-item].is-open [data-accordion-panel]").forEach(function (panel) {
          panel.style.maxHeight = panel.scrollHeight + "px";
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccordions);
  } else {
    initAccordions();
  }
})();

(function () {
  function initBlogLoadMore() {
    const grid = document.querySelector("[data-blog-grid]");
    const button = document.querySelector("[data-blog-loadmore]");
    if (!grid || !button) return;

    button.addEventListener("click", function (event) {
      // Let non-JS / modified clicks fall back to normal navigation.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();

      const url = button.getAttribute("href");
      if (!url || button.getAttribute("aria-busy") === "true") return;

      const label = button.getAttribute("data-label") || button.textContent;
      button.setAttribute("aria-busy", "true");
      button.textContent = "Loading…";

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.text();
        })
        .then(function (html) {
          const doc = new DOMParser().parseFromString(html, "text/html");
          const newItems = doc.querySelectorAll("[data-blog-grid] [data-blog-item]");
          let firstAppended = null;

          newItems.forEach(function (item, index) {
            const node = document.importNode(item, true);
            grid.appendChild(node);
            if (index === 0) firstAppended = node;
          });

          // Point the button at the following page, or remove it when done.
          const nextButton = doc.querySelector("[data-blog-loadmore]");
          const nextUrl = nextButton && nextButton.getAttribute("href");

          button.setAttribute("aria-busy", "false");
          button.textContent = label;

          if (nextUrl) {
            button.setAttribute("href", nextUrl);
          } else {
            const wrapper = button.closest(".blog-posts__loadmore");
            if (wrapper) wrapper.remove();
            else button.remove();
          }

          // Scroll to the top of the newly added items and focus for a11y.
          if (firstAppended) {
            const top = firstAppended.getBoundingClientRect().top + window.pageYOffset - 20;
            window.scrollTo({ top: top, behavior: "smooth" });
            firstAppended.setAttribute("tabindex", "-1");
            firstAppended.focus({ preventScroll: true });
          }
        })
        .catch(function () {
          // On failure, restore the button and fall back to a full navigation.
          button.setAttribute("aria-busy", "false");
          button.textContent = label;
          window.location.href = url;
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlogLoadMore);
  } else {
    initBlogLoadMore();
  }
})();

(function () {
  function initCollectionSort() {
    document.querySelectorAll("[data-collection-sort]").forEach(function (select) {
      if (select.dataset.sortInit) return;
      select.dataset.sortInit = "true";
      select.addEventListener("change", function () {
        const url = new URL(window.location.href);
        url.searchParams.set("sort_by", select.value);
        // Reset to the first page when the sort order changes.
        url.searchParams.delete("page");
        window.location.href = url.toString();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCollectionSort);
  } else {
    initCollectionSort();
  }
})();

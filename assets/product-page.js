(function () {
  function formatMoney(cents) {
    const numeric = Number(cents);
    if (!Number.isFinite(numeric)) return "";
    const amount = (numeric / 100).toFixed(2);
    const amountNoDecimals = String(Math.round(numeric / 100));
    const format = (window.Shopify && window.Shopify.money_format) || "${{amount}}";
    return format
      .replace(/\{\{\s*amount\s*\}\}/g, amount)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, amountNoDecimals)
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, amount.replace(".", ","))
      .replace(
        /\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g,
        amountNoDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      );
  }

  function initSection(section) {
    if (section.dataset.productInitialized) return;
    section.dataset.productInitialized = "true";

    const jsonEl = section.querySelector("[data-product-variants-json]");
    let variants = [];
    try {
      variants = JSON.parse(jsonEl ? jsonEl.textContent : "[]");
    } catch (e) {
      variants = [];
    }

    const idInput = section.querySelector("[data-variant-id]");
    const priceCurrent = section.querySelector("[data-price-current]");
    const priceCompare = section.querySelector("[data-price-compare]");
    const addBtn = section.querySelector("[data-add-btn]");
    const selects = Array.from(section.querySelectorAll("[data-option-select]"));
    const mainImage = section.querySelector("img.product-main__image");

    const labels = { add: "Order Now", soldOut: "Sold Out", unavailable: "Unavailable" };

    function selectedOptions() {
      const byPosition = [];
      selects.forEach(function (select) {
        byPosition[parseInt(select.dataset.optionPosition, 10)] = select.value;
      });
      return byPosition;
    }

    function findVariant() {
      if (variants.length === 1) return variants[0];
      const selected = selectedOptions();
      if (!selected.length) return null;
      return (
        variants.find(function (variant) {
          return variant.options.every(function (val, i) {
            return val === selected[i];
          });
        }) || null
      );
    }

    function updateForVariant(variant) {
      if (!variant) {
        if (idInput) idInput.value = "";
        if (addBtn) {
          addBtn.disabled = true;
          addBtn.textContent = labels.unavailable;
        }
        return;
      }

      if (idInput) idInput.value = variant.id;

      if (priceCurrent) priceCurrent.textContent = formatMoney(variant.price);
      if (priceCompare) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          priceCompare.textContent = formatMoney(variant.compare_at_price);
          priceCompare.style.display = "";
        } else {
          priceCompare.style.display = "none";
        }
      }

      if (addBtn) {
        if (variant.available) {
          addBtn.disabled = false;
          addBtn.textContent = labels.add;
        } else {
          addBtn.disabled = true;
          addBtn.textContent = labels.soldOut;
        }
      }

      if (mainImage && variant.featured_image && variant.featured_image.src) {
        mainImage.src = variant.featured_image.src;
        mainImage.srcset = "";
      }
    }

    selects.forEach(function (select) {
      select.addEventListener("change", function () {
        updateForVariant(findVariant());
      });
    });

    updateForVariant(findVariant());
  }

  function initAll() {
    document.querySelectorAll('[data-section-type="product-main"]').forEach(initSection);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();

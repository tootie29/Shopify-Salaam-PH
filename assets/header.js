(function () {
  function initHeader() {
    const modal = document.querySelector("[data-modal]");
    const openButtons = document.querySelectorAll("[data-modal-open]");
    const closeButtons = document.querySelectorAll("[data-modal-close]");
    const header = document.querySelector(".site-header");
    const searchForm = document.querySelector(".site-header__search");
    const searchButton = document.querySelector(".site-header__search-button");
    const searchInput = document.querySelector(".site-header__search-input");

    const contactDropdown = document.querySelector("[data-contact-dropdown]");
    const contactDropdownTrigger = contactDropdown && contactDropdown.querySelector(".site-header__contact-btn");
    const contactDropdownMenu = contactDropdown && contactDropdown.querySelector(".site-header__menu-dropdown");

    const drawer = document.querySelector("[data-drawer]");
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const drawerCloseEls = document.querySelectorAll("[data-drawer-close]");

    const toggleDrawer = function (shouldOpen) {
      if (!drawer) return;
      drawer.classList.toggle("is-active", shouldOpen);
      drawer.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
      document.documentElement.classList.toggle("modal-open", shouldOpen);
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      }
    };

    if (menuToggle && drawer) {
      menuToggle.addEventListener("click", function () {
        toggleDrawer(true);
      });
      drawerCloseEls.forEach(function (el) {
        el.addEventListener("click", function () {
          toggleDrawer(false);
        });
      });
      drawer.querySelectorAll(".site-header__drawer-link").forEach(function (link) {
        link.addEventListener("click", function () {
          toggleDrawer(false);
        });
      });
    }

    const openContactDropdown = function () {
      if (!contactDropdown || !contactDropdownTrigger) return;
      contactDropdown.classList.add("is-dropdown-open");
      contactDropdownTrigger.setAttribute("aria-expanded", "true");
      if (contactDropdownMenu) {
        contactDropdownMenu.setAttribute("aria-hidden", "false");
      }
    };

    const closeContactDropdown = function () {
      if (!contactDropdown || !contactDropdownTrigger) return;
      contactDropdown.classList.remove("is-dropdown-open");
      contactDropdownTrigger.setAttribute("aria-expanded", "false");
      if (contactDropdownMenu) {
        contactDropdownMenu.setAttribute("aria-hidden", "true");
      }
    };

    const toggleContactDropdown = function () {
      if (contactDropdown && contactDropdown.classList.contains("is-dropdown-open")) {
        closeContactDropdown();
      } else {
        openContactDropdown();
      }
    };

    if (contactDropdown && contactDropdownTrigger) {
      contactDropdown.addEventListener("mouseenter", openContactDropdown);
      contactDropdown.addEventListener("mouseleave", closeContactDropdown);
      contactDropdownTrigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleContactDropdown();
      });
      document.addEventListener("click", function (e) {
        if (!contactDropdown.contains(e.target)) closeContactDropdown();
      });
    }

    const toggleModal = function (shouldOpen) {
    if (!modal) return;
    modal.classList.toggle("is-active", shouldOpen);
    modal.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    document.documentElement.classList.toggle("modal-open", shouldOpen);
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => toggleModal(true));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => toggleModal(false));
  });

  const contactForm = document.getElementById("HeaderContactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formFields = contactForm.querySelector(".site-header__form-fields");
      const submitBtn = contactForm.querySelector(".site-header__submit-btn");
      const existingSuccess = contactForm.querySelector(".site-header__modal-success");
      if (existingSuccess) existingSuccess.remove();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { "X-Requested-With": "XMLHttpRequest" }
      })
        .then(function (res) { return res.text(); })
        .then(function (html) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          }
          if (html.indexOf("form-success") !== -1 || html.indexOf("contact form was successfully sent") !== -1) {
            const thankYou = document.createElement("p");
            thankYou.className = "site-header__modal-success";
            thankYou.textContent = "Thank you. We received your message.";
            if (formFields && formFields.parentNode) {
              formFields.parentNode.insertBefore(thankYou, formFields);
            } else {
              contactForm.insertBefore(thankYou, contactForm.firstChild);
            }
            contactForm.reset();
          }
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          }
          const thankYou = document.createElement("p");
          thankYou.className = "site-header__modal-success site-header__modal-success--error";
          thankYou.textContent = "Something went wrong. Please try again.";
          if (formFields && formFields.parentNode) {
            formFields.parentNode.insertBefore(thankYou, formFields);
          } else {
            contactForm.insertBefore(thankYou, contactForm.firstChild);
          }
        });
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (contactDropdown && contactDropdown.classList.contains("is-dropdown-open")) {
        closeContactDropdown();
      }
      if (modal && modal.classList.contains("is-active")) {
        toggleModal(false);
      }
      if (drawer && drawer.classList.contains("is-active")) {
        toggleDrawer(false);
      }
      if (header) {
        header.classList.remove("is-search-open");
      }
    }
  });

  if (searchButton && searchForm && searchInput && header) {
    searchButton.addEventListener("click", () => {
      const isOpen = header.classList.contains("is-search-open");
      if (!isOpen) {
        header.classList.add("is-search-open");
        searchInput.focus();
        return;
      }

      searchForm.submit();
    });

    searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        header.classList.remove("is-search-open");
      }, 120);
    });

    document.addEventListener("click", (event) => {
      if (!header.classList.contains("is-search-open")) return;
      if (searchForm.contains(event.target)) return;
      if (searchButton.contains(event.target)) return;
      header.classList.remove("is-search-open");
    });
  }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
  } else {
    initHeader();
  }
})();

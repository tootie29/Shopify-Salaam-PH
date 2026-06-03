(() => {
    if (window.__productModalInit) return;
    window.__productModalInit = true;

    const cartCountEls = Array.from(document.querySelectorAll('[data-cart-count]'));

    function renderCartCount(count) {
        cartCountEls.forEach((el) => {
            if (!el) return;
            if (count > 0) {
                el.textContent = count;
                el.hidden = false;
            } else {
                el.textContent = '';
                el.hidden = true;
            }
        });
    }

    function refreshCartCount() {
        if (!cartCountEls.length) return Promise.resolve();

        return fetch('/cart.js')
            .then((res) => {
                if (!res.ok) throw new Error('Cart fetch failed');
                return res.json();
            })
            .then((cart) => {
                renderCartCount((cart && cart.item_count) || 0);
            })
            .catch(() => {
                /* Swallow count refresh errors to avoid blocking add-to-cart UX */
            });
    }

    function initSection(sectionEl) {
        if (!sectionEl || sectionEl.dataset.modalInitialized) return;
        const modal = sectionEl.querySelector('.product-modal');
        if (!modal) return;

        const backdrop = modal.querySelector('.product-modal__backdrop');
        const closeBtn = modal.querySelector('.product-modal__close');
        const imageWrap = modal.querySelector('.product-modal__image');
        const titleEl = modal.querySelector('.product-modal__title');
        const descEl = modal.querySelector('.product-modal__description');
    const priceEl = modal.querySelector('.product-modal__price');
    const variantWrap = modal.querySelector('.product-modal__variant');
    const variantOptions = modal.querySelector('.product-modal__variant-options');
        const qtyInput = modal.querySelector('.product-modal__qty-input');
        const qtyBtns = modal.querySelectorAll('.product-modal__qty-btn');
        const addBtn = modal.querySelector('.product-modal__add');

        let currentVariantId = null;
        let currentVariants = [];

        function formatMoney(cents) {
            const numeric = Number(cents);
            if (!Number.isFinite(numeric)) return '';
            const amount = (numeric / 100).toFixed(2);
            const amountNoDecimals = String(Math.round(numeric / 100));
            const format = (window.Shopify && window.Shopify.money_format) || '${{amount}}';
            return format
                .replace(/\{\{\s*amount\s*\}\}/g, amount)
                .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, amountNoDecimals)
                .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, amount.replace('.', ','))
                .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, amountNoDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        }

        function updateVariantState(variant) {
            if (!variant) return;
            currentVariantId = variant.id;
            if (priceEl) priceEl.textContent = formatMoney(variant.price);
            if (addBtn) {
                if (variant.available) {
                    addBtn.disabled = false;
                    addBtn.textContent = 'Add to cart';
                } else {
                    addBtn.disabled = true;
                    addBtn.textContent = 'Unavailable';
                }
            }
        }

        function openModal(data) {
            currentVariants = Array.isArray(data.variants) ? data.variants : [];
            const initialVariant =
                currentVariants.find((variant) => String(variant.id) === String(data.variantId)) ||
                currentVariants.find((variant) => variant.available) ||
                currentVariants[0] ||
                null;
            if (qtyInput) qtyInput.value = 1;

            if (data.image) {
                imageWrap.innerHTML = `<img src="${data.image}" alt="${data.title || ''}">`;
            } else {
                imageWrap.innerHTML = '';
            }
            titleEl.textContent = data.title || '';
            descEl.textContent = data.description || '';

            if (variantWrap && variantOptions) {
                if (currentVariants.length > 1) {
                    variantWrap.style.display = '';
                    variantOptions.innerHTML = '';
                    currentVariants.forEach((variant) => {
                        const optionWrap = document.createElement('div');
                        optionWrap.className = 'product-modal__variant-option';

                        const input = document.createElement('input');
                        input.type = 'radio';
                        input.name = `product-variant-${sectionEl.dataset.sectionId}`;
                        input.value = variant.id;
                        input.id = `product-variant-${sectionEl.dataset.sectionId}-${variant.id}`;
                        input.className = 'product-modal__variant-input';
                        input.disabled = !variant.available;

                        const label = document.createElement('label');
                        label.className = 'product-modal__variant-pill';
                        label.setAttribute('for', input.id);
                        label.textContent = variant.title;

                        optionWrap.appendChild(input);
                        optionWrap.appendChild(label);
                        variantOptions.appendChild(optionWrap);
                    });
                    if (initialVariant) {
                        const initialInput = variantOptions.querySelector(
                            `.product-modal__variant-input[value="${initialVariant.id}"]`
                        );
                        if (initialInput) initialInput.checked = true;
                    }
                } else {
                    variantWrap.style.display = 'none';
                }
            }

            updateVariantState(initialVariant);

            modal.classList.add('is-visible');
            modal.setAttribute('aria-hidden', 'false');
        }

        function closeModal() {
            modal.classList.remove('is-visible');
            modal.setAttribute('aria-hidden', 'true');
        }

        function adjustQty(delta) {
            if (!qtyInput) return;
            let val = parseInt(qtyInput.value || '1', 10);
            val = Number.isNaN(val) ? 1 : val + delta;
            if (val < 1) val = 1;
            qtyInput.value = val;
        }

        sectionEl.querySelectorAll('.best-seller-item').forEach((card) => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let variants = [];
                try {
                    variants = JSON.parse(card.dataset.productVariants || '[]');
                } catch (err) {
                    variants = [];
                }
                const data = {
                    title: card.dataset.productTitle || '',
                    description: card.dataset.productDescription || '',
                    image: card.dataset.productImage || '',
                    variantId: card.dataset.variantId || null,
                    variants,
                };
                openModal(data);
            });
        });

        qtyBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                adjustQty(action === 'increment' ? 1 : -1);
            });
        });

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                let qty = parseInt((qtyInput && qtyInput.value) || '1', 10);
                qty = Number.isNaN(qty) || qty < 1 ? 1 : qty;
                if (!currentVariantId) return;

                const setState = (state) => {
                    if (!addBtn) return;
                    if (state === 'loading') {
                        addBtn.disabled = true;
                        addBtn.textContent = 'Adding...';
                    } else if (state === 'added') {
                        addBtn.disabled = false;
                        addBtn.textContent = 'Added';
                    } else {
                        addBtn.disabled = false;
                        addBtn.textContent = 'Add to cart';
                    }
                };

                setState('loading');
                fetch('/cart/add.js', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: currentVariantId,
                            quantity: qty
                        }),
                    })
                    .then((res) => {
                        if (!res.ok) throw new Error('Add to cart failed');
                        return res.json();
                    })
                    .then(() => refreshCartCount())
                    .then(() => {
                        setState('added');
                        // Close the modal once the add-to-cart succeeds
                        closeModal();
                        setTimeout(() => setState('default'), 1200);
                    })
                    .catch(() => {
                        setState('default');
                        alert('Unable to add to cart. Please try again.');
                    });
            });
        }

        if (variantOptions) {
            variantOptions.addEventListener('change', (event) => {
                const target = event.target;
                if (!target || !target.classList.contains('product-modal__variant-input')) return;
                const selectedId = target.value;
                const selectedVariant = currentVariants.find(
                    (variant) => String(variant.id) === String(selectedId)
                );
                updateVariantState(selectedVariant);
            });
        }

        [backdrop, closeBtn].forEach((el) => {
            if (!el) return;
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        sectionEl.dataset.modalInitialized = 'true';
    }

    function initAll() {
        document.querySelectorAll('[data-section-id]').forEach(initSection);

        // Fallback: if no sections are marked, attempt to init known modal containers
        if (!document.querySelector('[data-section-id]')) {
            document.querySelectorAll('.section.best-seller-section, .section.grid-section').forEach(initSection);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
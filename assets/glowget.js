/* GLOW&GET Maison — interactions
   Panier AJAX, favoris, variantes, slider de campagne, tiroirs. */
(function () {
  'use strict';

  var G = window.GlowGet || { routes: { root: '/', cart: '/cart', cartAdd: '/cart/add', cartChange: '/cart/change' }, strings: {} };
  var S = G.strings;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Toast
  ------------------------------------------------------------------ */
  var toastTimer;
  function toast(msg) {
    var el = $('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  /* ------------------------------------------------------------------
     Panels (cart drawer, menu drawer, search)
  ------------------------------------------------------------------ */
  var overlay = $('[data-overlay]');
  var openPanel = null;
  var lastFocus = null;

  function panelEl(name) { return $('[data-panel="' + name + '"]'); }

  function open(name) {
    var el = panelEl(name);
    if (!el) return false;
    if (openPanel && openPanel !== el) close(true);
    lastFocus = document.activeElement;
    el.hidden = false;
    overlay.hidden = false;
    document.body.classList.add('is-locked');
    $$('[data-open="' + name + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-open');
        overlay.classList.add('is-visible');
      });
    });
    openPanel = el;
    var focusTarget = name === 'search' ? $('#SearchPanelInput') : $('[data-close]', el);
    setTimeout(function () { focusTarget && focusTarget.focus(); }, 80);
    return true;
  }

  function close(silent) {
    var el = openPanel;
    if (!el) return;
    el.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    $$('[data-open="' + el.dataset.panel + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    var done = function () { el.hidden = true; if (!openPanel) overlay.hidden = true; };
    if (reduceMotion) done(); else setTimeout(done, 450);
    openPanel = null;
    document.body.classList.remove('is-locked');
    if (!silent && lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open]');
    if (opener) {
      var name = opener.dataset.open;
      if (name === 'cart' && G.cartType === 'page') return;
      if (name === 'cart' && document.body.classList.contains('template-cart')) return;
      if (open(name)) e.preventDefault();
      return;
    }
    if (e.target.closest('[data-close]') || e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openPanel) close();
    if (e.key === 'Tab' && openPanel) {
      var f = $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, summary', openPanel)
        .filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  /* ------------------------------------------------------------------
     Cart
  ------------------------------------------------------------------ */
  function setCartCount(n) {
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.hidden = !n;
    });
    $$('[data-open="cart"]').forEach(function (el) {
      el.setAttribute('aria-label', 'Panier, ' + n + ' article(s)');
    });
  }

  function refreshCartSections() {
    var targets = $$('[data-cart-section]');
    var ids = targets.map(function (t) { return t.dataset.cartSection; });
    if (!ids.length) return Promise.resolve();
    targets.forEach(function (t) { t.classList.add('is-updating'); });
    return fetch(G.routes.cart + '?sections=' + encodeURIComponent(ids.join(',')), { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        targets.forEach(function (t) {
          var html = data[t.dataset.cartSection];
          if (!html) return;
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var fresh = doc.querySelector('[data-cart-section="' + t.dataset.cartSection + '"]');
          if (fresh) t.innerHTML = fresh.innerHTML;
          t.classList.remove('is-updating');
        });
        var src = $('[data-cart-count-source]');
        if (src) setCartCount(parseInt(src.textContent, 10) || 0);
      })
      .catch(function () { targets.forEach(function (t) { t.classList.remove('is-updating'); }); });
  }

  function addToCart(formData, button) {
    if (button) button.classList.add('is-loading');
    return fetch(G.routes.cartAdd + '.js', {
      method: 'POST',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: formData
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.body.description || res.body.message || S.error);
        if (G.cartType === 'page') { window.location.href = G.routes.cart; return; }
        return refreshCartSections().then(function () {
          toast(S.added);
          if (!document.body.classList.contains('template-cart')) open('cart');
        });
      })
      .finally(function () { if (button) button.classList.remove('is-loading'); });
  }

  function changeLine(line, qty) {
    return fetch(G.routes.cartChange + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: line, quantity: Math.max(0, qty) })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) toast(res.body.description || res.body.message || S.error);
        return refreshCartSections();
      });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-line-change]');
    if (!btn) return;
    e.preventDefault();
    changeLine(parseInt(btn.dataset.lineChange, 10), parseInt(btn.dataset.qtyTo, 10));
  });

  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-line-input]');
    if (!input) return;
    changeLine(parseInt(input.dataset.lineInput, 10), parseInt(input.value, 10) || 0);
  });

  /* Quick add from product cards */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.matches('[data-quick-add]')) {
      e.preventDefault();
      var hasChoice = form.querySelector('input[name="id"][type="hidden"], input[name="id"]:checked');
      if (!hasChoice) {
        var card = form.closest('.card');
        toast(S.chooseSize);
        if (card) {
          card.classList.remove('is-shaking'); void card.offsetWidth; card.classList.add('is-shaking');
        }
        var first = form.querySelector('input[name="id"]:not([disabled])');
        if (first) first.focus();
        return;
      }
      addToCart(new FormData(form), form.querySelector('[type="submit"]')).catch(function (err) { toast(err.message); });
    }
    if (form.matches('[data-product-form]')) {
      e.preventDefault();
      var error = form.querySelector('[data-form-error]');
      if (error) error.hidden = true;
      addToCart(new FormData(form), form.querySelector('[data-add-button]')).catch(function (err) {
        if (error) { error.textContent = err.message; error.hidden = false; }
      });
    }
  });

  /* Update SKU on product cards when a size is picked */
  document.addEventListener('change', function (e) {
    var radio = e.target.closest('.card__sizes input[name="id"]');
    if (!radio) return;
    var card = radio.closest('.card');
    var sku = card && card.querySelector('[data-card-sku]');
    if (sku) sku.textContent = radio.dataset.sku || '—';
  });

  /* ------------------------------------------------------------------
     Wishlist (favoris) — stockés sur l'appareil (localStorage)
  ------------------------------------------------------------------ */
  var WKEY = 'glowget:wishlist';
  function getWish() {
    try { return JSON.parse(localStorage.getItem(WKEY)) || []; } catch (err) { return []; }
  }
  function setWish(list) {
    try { localStorage.setItem(WKEY, JSON.stringify(list)); } catch (err) { /* storage unavailable */ }
    syncWish();
  }
  function syncWish() {
    var list = getWish();
    $$('[data-wish]').forEach(function (btn) {
      var on = list.indexOf(btn.dataset.wish) !== -1;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var label = on ? btn.dataset.labelRemove : btn.dataset.labelAdd;
      if (label) btn.setAttribute('aria-label', label);
    });
    $$('[data-wish-count]').forEach(function (el) {
      el.textContent = list.length;
      el.hidden = !list.length;
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wish]');
    if (!btn) return;
    e.preventDefault();
    var handle = btn.dataset.wish;
    var list = getWish();
    var idx = list.indexOf(handle);
    if (idx === -1) { list.unshift(handle); toast(S.wishlistAdded); }
    else { list.splice(idx, 1); toast(S.wishlistRemoved); }
    btn.classList.remove('is-pop'); void btn.offsetWidth; btn.classList.add('is-pop');
    setWish(list);
    if (idx !== -1) {
      var pageCard = btn.closest('[data-wishlist-grid] .card');
      if (pageCard) { pageCard.remove(); toggleWishEmpty(); }
    }
  });

  window.addEventListener('storage', function (e) { if (e.key === WKEY) syncWish(); });

  function toggleWishEmpty() {
    var grid = $('[data-wishlist-grid]');
    var empty = $('[data-wishlist-empty]');
    if (!grid || !empty) return;
    empty.hidden = grid.children.length > 0;
  }

  function renderWishlistPage() {
    var grid = $('[data-wishlist-grid]');
    if (!grid) return;
    var list = getWish();
    if (!list.length) { toggleWishEmpty(); return; }
    Promise.all(list.map(function (handle) {
      return fetch(G.routes.root.replace(/\/$/, '') + '/products/' + encodeURIComponent(handle) + '?view=card')
        .then(function (r) { return r.ok ? r.text() : ''; })
        .catch(function () { return ''; });
    })).then(function (htmls) {
      var valid = [];
      htmls.forEach(function (html, i) {
        if (html && html.indexOf('data-product-card') !== -1) {
          grid.insertAdjacentHTML('beforeend', html);
          valid.push(list[i]);
        }
      });
      if (valid.length !== list.length) setWish(valid); else syncWish();
      toggleWishEmpty();
    });
  }

  /* ------------------------------------------------------------------
     Product page: variants, quantity, gallery
  ------------------------------------------------------------------ */
  function formatLow(n) { return (S.lowStock || '').replace('[count]', n); }

  function initProduct(root) {
    var jsonEl = $('[data-product-json]', root);
    if (!jsonEl) return;
    var data = JSON.parse(jsonEl.textContent);
    var form = $('[data-product-form]', root);
    var idInput = $('[data-variant-id]', root);
    var addBtn = $('[data-add-button]', root);
    var addLabel = $('[data-add-label]', root);
    var skuEl = $('[data-pdp-sku]', root);
    var priceEl = $('[data-pdp-price]', root);
    var stockEl = $('[data-stock]', root);
    var fieldsets = $$('.opt', root);

    function selectedOptions() {
      return fieldsets.map(function (fs) {
        var c = fs.querySelector('input:checked');
        return c ? c.value : null;
      });
    }

    function findVariant(opts) {
      return data.variants.filter(function (v) {
        return v.options.every(function (o, i) { return o === opts[i]; });
      })[0];
    }

    function markAvailability(opts) {
      fieldsets.forEach(function (fs, idx) {
        $$('input', fs).forEach(function (input) {
          var test = opts.slice(); test[idx] = input.value;
          var match = data.variants.filter(function (v) {
            return v.options.every(function (o, i) { return o === test[i]; });
          })[0];
          input.closest('.chip').classList.toggle('chip--off', !match || !match.available);
        });
        var current = fs.querySelector('input:checked');
        var label = fs.querySelector('[data-option-value]');
        if (label && current) label.textContent = current.value;
      });
    }

    function update() {
      var opts = selectedOptions();
      var v = findVariant(opts);
      markAvailability(opts);
      if (!v) {
        addBtn.disabled = true;
        addLabel.textContent = S.unavailable;
        return;
      }
      idInput.value = v.id;
      skuEl.textContent = v.sku || '—';
      priceEl.innerHTML = '<span class="price' + (v.compare ? ' price--sale' : '') + '" data-price><span class="price__current">' + v.price + '</span>' +
        (v.compare ? ' <s class="price__compare">' + v.compare + '</s>' : '') + '</span>';
      addBtn.disabled = !v.available;
      addLabel.textContent = v.available ? S.addToCart : S.soldOut;
      var stock;
      if (!v.available) stock = '<span class="stock stock--out">' + S.soldOut + '</span>';
      else if (v.tracked && v.qty > 0 && v.qty <= data.lowStock) stock = '<span class="stock stock--low">' + formatLow(v.qty) + '</span>';
      else stock = '<span class="stock stock--in">' + S.inStock + '</span>';
      stockEl.innerHTML = stock;

      var url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      window.history.replaceState({}, '', url.toString());

      if (v.media) {
        var target = $('[data-media-id="' + v.media + '"]', root);
        var track = $('[data-gallery-track]', root);
        if (target && track) {
          if (window.matchMedia('(max-width: 989px)').matches) {
            track.scrollTo({ left: target.offsetLeft - track.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
          } else if (target.getBoundingClientRect().top < 0 || target.getBoundingClientRect().top > window.innerHeight) {
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          }
        }
      }
    }

    if (form) form.addEventListener('change', function (e) {
      if (e.target.closest('.opt')) update();
    });
    if (fieldsets.length) markAvailability(selectedOptions());

    $$('[data-qty-step]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var input = $('[data-qty-input]', root);
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(b.dataset.qtyStep, 10));
      });
    });

    // Mobile gallery dots
    var track = $('[data-gallery-track]', root);
    var dots = $('[data-gallery-dots]', root);
    if (track && dots) {
      var items = $$('.pdp__media', track);
      if (items.length > 1) {
        dots.innerHTML = items.map(function (_, i) { return '<span' + (i === 0 ? ' class="is-active"' : '') + '></span>'; }).join('');
        var spans = $$('span', dots);
        track.addEventListener('scroll', function () {
          var idx = Math.round(track.scrollLeft / (items[0].offsetWidth + 8));
          spans.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
        }, { passive: true });
      }
    }
  }

  /* ------------------------------------------------------------------
     Hero slider
  ------------------------------------------------------------------ */
  function initSlider(root) {
    var slides = $$('[data-slide]', root);
    if (slides.length < 2) return;
    var dots = $$('[data-dot]', root);
    var pauseBtn = $('[data-pause]', root);
    var index = 0;
    var timer = null;
    var speed = parseInt(root.dataset.speed, 10) || 7000;
    var playing = root.dataset.autoplay === 'true' && !reduceMotion;

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        var on = n === index;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
        $$('a, button', s).forEach(function (el) { el.tabIndex = on ? 0 : -1; });
      });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === index);
        if (n === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }
    function start() { stop(); if (playing) timer = setInterval(function () { go(index + 1); }, speed); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    go(0);
    var prev = $('[data-prev]', root), next = $('[data-next]', root);
    if (prev) prev.addEventListener('click', function () { go(index - 1); start(); });
    if (next) next.addEventListener('click', function () { go(index + 1); start(); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(parseInt(d.dataset.dot, 10)); start(); }); });
    if (pauseBtn) {
      if (!playing) { pauseBtn.textContent = 'Lecture'; pauseBtn.setAttribute('aria-label', 'Reprendre le défilement'); }
      pauseBtn.addEventListener('click', function () {
        playing = !playing;
        pauseBtn.textContent = playing ? 'Pause' : 'Lecture';
        pauseBtn.setAttribute('aria-label', playing ? 'Mettre en pause le défilement' : 'Reprendre le défilement');
        start();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    // Swipe
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { go(index + (dx < 0 ? 1 : -1)); start(); }
      x0 = null;
    });

    // Theme editor: show selected block
    document.addEventListener('shopify:block:select', function (e) {
      var i = slides.indexOf(e.target);
      if (i !== -1) { stop(); go(i); }
    });
    start();
  }

  /* ------------------------------------------------------------------
     Announcement rotation
  ------------------------------------------------------------------ */
  function initAnnounce(root) {
    var msgs = $$('.announce__msg', root);
    if (msgs.length < 2 || reduceMotion) return;
    var i = 0;
    setInterval(function () {
      msgs[i].classList.remove('is-active');
      i = (i + 1) % msgs.length;
      msgs[i].classList.add('is-active');
    }, 4500);
  }

  /* ------------------------------------------------------------------
     Header condensing on scroll
  ------------------------------------------------------------------ */
  function initHeader() {
    var header = $('[data-header].header--sticky');
    if (!header) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle('is-condensed', window.scrollY > 140);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Customer login: show password recovery
  ------------------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toggle-recover]');
    if (!t) return;
    var box = document.getElementById('recover');
    if (box) { e.preventDefault(); box.classList.add('is-open'); box.querySelector('input').focus(); }
  });

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  function boot() {
    syncWish();
    initHeader();
    $$('[data-announce]').forEach(initAnnounce);
    $$('[data-slider]').forEach(initSlider);
    $$('[data-product]').forEach(initProduct);
    renderWishlistPage();
    if (window.location.search.indexOf('customer_posted=true') !== -1) {
      var club = document.getElementById('newsletter');
      if (club) club.scrollIntoView({ block: 'center' });
    }
  }

  // Theme editor support
  document.addEventListener('shopify:section:load', function (e) {
    $$('[data-slider]', e.target).forEach(initSlider);
    $$('[data-product]', e.target).forEach(initProduct);
    $$('[data-announce]', e.target).forEach(initAnnounce);
    syncWish();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  G.open = open; G.close = close; G.refreshCart = refreshCartSections;
})();

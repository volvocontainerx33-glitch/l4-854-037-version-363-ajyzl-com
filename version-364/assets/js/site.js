(function () {
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobileNav && header) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      header.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-missing');
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var searchInput = document.querySelector('[data-search]');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
  var emptyResult = document.querySelector('[data-empty-result]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = '';

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function applySearch() {
    if (!items.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var filter = normalize(activeFilter);
    var visible = 0;

    items.forEach(function (item) {
      var keywords = normalize(item.getAttribute('data-keywords'));
      var queryMatch = !query || keywords.indexOf(query) !== -1;
      var filterMatch = !filter || filter.split(' ').some(function (part) {
        return part && keywords.indexOf(part) !== -1;
      });
      var showItem = queryMatch && filterMatch;
      item.classList.toggle('is-hidden', !showItem);
      if (showItem) {
        visible += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', applySearch);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter-value') || '';
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applySearch();
    });
  });

  applySearch();
})();

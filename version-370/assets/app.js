(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector('.local-filter');
    if (!input) return;
    var cards = selectAll('.movie-card-item');
    function apply() {
      var value = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        card.classList.toggle('hide-card', value && haystack.indexOf(value) === -1);
      });
    }
    input.addEventListener('input', apply);
    apply();
  }

  function setupSearchPage() {
    var input = document.querySelector('.global-search-input');
    if (!input) return;
    var cards = selectAll('.movie-card-item');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;
    function apply() {
      var value = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        card.classList.toggle('hide-card', value && haystack.indexOf(value) === -1);
      });
    }
    input.addEventListener('input', apply);
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();

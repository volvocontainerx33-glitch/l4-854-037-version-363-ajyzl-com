(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.hasAttribute('hidden');
      if (opened) {
        mobileNav.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.textContent = '×';
      } else {
        mobileNav.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = '☰';
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('is-active', idx === current);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === current);
    });
  }

  var next = document.querySelector('.hero-next');
  var prev = document.querySelector('.hero-prev');
  if (next) next.addEventListener('click', function () { showSlide(current + 1); });
  if (prev) prev.addEventListener('click', function () { showSlide(current - 1); });
  dots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () { showSlide(idx); });
  });
  if (slides.length > 1) {
    window.setInterval(function () { showSlide(current + 1); }, 5200);
  }

  var localSearch = document.querySelector('.local-search');
  var sortSelect = document.querySelector('.local-sort');
  var grid = document.querySelector('.filter-grid');
  var empty = document.querySelector('.empty-state');

  function applyLocalFilter() {
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var query = localSearch ? localSearch.value.trim().toLowerCase() : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var matched = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('hidden-card', !matched);
      if (matched) visible += 1;
    });
    if (sortSelect) {
      var mode = sortSelect.value;
      cards.sort(function (a, b) {
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
        }
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      }).forEach(function (card) {
        grid.appendChild(card);
      });
    }
    if (empty) empty.hidden = visible !== 0;
  }

  if (localSearch) localSearch.addEventListener('input', applyLocalFilter);
  if (sortSelect) sortSelect.addEventListener('change', applyLocalFilter);
  applyLocalFilter();

  var searchBox = document.querySelector('#globalSearchInput');
  var searchResults = document.querySelector('#searchResults');

  function renderSearchResults() {
    if (!searchBox || !searchResults || !Array.isArray(window.MOVIES)) return;
    var query = searchBox.value.trim().toLowerCase();
    var list = window.MOVIES.filter(function (movie) {
      if (!query) return true;
      return movie.search.indexOf(query) !== -1;
    }).slice(0, query ? 120 : 48);
    searchResults.innerHTML = list.map(function (movie) {
      return [
        '<article class="movie-card">',
        '  <a href="movie/' + movie.file + '">',
        '    <div class="poster-wrap">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '      <span class="play-badge">▶</span>',
        '    </div>',
        '    <div class="movie-info">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }).join('');
    if (!list.length) {
      searchResults.innerHTML = '<div class="empty-state">未找到匹配内容，请尝试其他关键词。</div>';
    }
  }

  if (searchBox) {
    searchBox.addEventListener('input', renderSearchResults);
    renderSearchResults();
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();

function setupPlayer(videoId, buttonId, coverId, stream) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  var hlsInstance = null;
  var started = false;

  function start() {
    if (!video || !stream) return;
    if (cover) cover.classList.add('is-hidden');
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        video.play().catch(function () {});
      } else {
        video.src = stream;
        video.play().catch(function () {});
      }
    } else {
      video.play().catch(function () {});
    }
  }

  if (button) button.addEventListener('click', start);
  if (cover) cover.addEventListener('click', start);
  if (video) {
    video.addEventListener('click', function () {
      if (!started) start();
    });
  }
  window.addEventListener('pagehide', function () {
    if (hlsInstance) hlsInstance.destroy();
  });
}

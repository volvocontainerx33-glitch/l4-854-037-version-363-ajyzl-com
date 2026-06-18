(function () {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let active = 0;
    let timer = null;

    const show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    };

    if (slides.length > 1) {
      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.dataset.heroDot || 0));
          start();
        });
      });

      start();
    }
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    const grid = document.querySelector('[data-card-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-movie-card]')) : [];
    const queryInput = filterPanel.querySelector('[data-filter-query]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const regionSelect = filterPanel.querySelector('[data-filter-region]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const sortSelect = filterPanel.querySelector('[data-sort-cards]');
    const note = document.querySelector('[data-result-note]');
    const params = new URLSearchParams(window.location.search);

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }

    const apply = function () {
      const q = queryInput ? queryInput.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category
        ].join(' ').toLowerCase();
        const okQuery = !q || text.includes(q);
        const okYear = !year || card.dataset.year === year;
        const okRegion = !region || card.dataset.region === region;
        const okType = !type || card.dataset.type === type;
        const showCard = okQuery && okYear && okRegion && okType;
        card.classList.toggle('is-hidden-card', !showCard);
        if (showCard) {
          visible += 1;
        }
      });

      if (note) {
        note.textContent = visible ? '已筛选出 ' + visible + ' 部相关内容' : '没有匹配内容';
      }
    };

    const sortCards = function () {
      if (!grid || !sortSelect) {
        return;
      }

      const mode = sortSelect.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (mode === 'newest') {
          return Number(b.dataset.year) - Number(a.dataset.year);
        }
        if (mode === 'oldest') {
          return Number(a.dataset.year) - Number(b.dataset.year);
        }
        if (mode === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        return cards.indexOf(a) - cards.indexOf(b);
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    };

    [queryInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }

    apply();
  }

  const video = document.querySelector('[data-player]');
  const playButton = document.querySelector('[data-play-button]');
  const playerCover = document.querySelector('.player-cover');

  if (video && playButton) {
    let attached = false;
    let hls = null;
    const stream = video.dataset.stream;

    const attachStream = function () {
      if (attached || !stream) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    const startPlayback = function () {
      attachStream();
      video.controls = true;
      if (playerCover) {
        playerCover.classList.add('is-hidden');
      }
      const playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    };

    playButton.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      if (playerCover) {
        playerCover.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();

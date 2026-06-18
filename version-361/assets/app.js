(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-site-nav]');

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

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startHeroTimer() {
        if (!slides.length) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        showSlide(0);
        startHeroTimer();
        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                startHeroTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHeroTimer();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHeroTimer();
            });
        });
    }

    var quickInput = document.querySelector('[data-quick-search]');
    var quickResults = document.querySelector('[data-quick-results]');

    if (quickInput && quickResults) {
        var quickItems = Array.prototype.slice.call(quickResults.querySelectorAll('[data-quick-item]'));
        quickInput.addEventListener('input', function () {
            var term = quickInput.value.trim().toLowerCase();
            var shown = 0;
            quickItems.forEach(function (item) {
                var matched = term.length > 0 && item.getAttribute('data-search').indexOf(term) !== -1 && shown < 6;
                item.style.display = matched ? '' : 'none';
                if (matched) {
                    shown += 1;
                }
            });
            quickResults.classList.toggle('is-open', shown > 0);
        });
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    filterForms.forEach(function (scope) {
        var input = scope.querySelector('[data-card-search]');
        var yearSelect = scope.querySelector('[data-year-filter]');
        var typeSelect = scope.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
        var empty = scope.querySelector('[data-no-results]');

        function applyFilters() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var yearValue = yearSelect ? yearSelect.value : 'all';
            var typeValue = typeSelect ? typeSelect.value : 'all';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var search = card.getAttribute('data-search') || '';
                var year = Number(card.getAttribute('data-year') || '0');
                var type = card.getAttribute('data-type') || '';
                var yearMatched = true;
                var typeMatched = typeValue === 'all' || type.indexOf(typeValue) !== -1;

                if (yearValue === '2020') {
                    yearMatched = year >= 2020;
                } else if (yearValue === '2010') {
                    yearMatched = year >= 2010 && year < 2020;
                } else if (yearValue === 'old') {
                    yearMatched = year < 2010;
                }

                var matched = search.indexOf(term) !== -1 && yearMatched && typeMatched;
                card.classList.toggle('hidden-by-filter', !matched);
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilters);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilters);
        }
        applyFilters();
    });
})();

function setupMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-play-button]');
    var attached = false;
    var pendingPlay = false;

    if (!video || !streamUrl) {
        return;
    }

    function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    function attachStream() {
        if (attached) {
            playVideo();
            return;
        }

        attached = true;
        pendingPlay = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (pendingPlay) {
                    playVideo();
                }
            });
            return;
        }

        video.src = streamUrl;
        playVideo();
    }

    function start(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        attachStream();
    }

    if (cover) {
        cover.addEventListener('click', start);
    }
    if (button) {
        button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });
}

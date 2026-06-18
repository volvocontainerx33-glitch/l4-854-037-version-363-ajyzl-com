document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    function syncHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (menuButton && mobileMenu && header) {
        menuButton.addEventListener('click', function () {
            var opened = mobileMenu.classList.toggle('is-open');
            header.classList.toggle('menu-active', opened);
            document.body.classList.toggle('menu-open', opened);
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var region = scope.querySelector('[data-filter-region]');
        var year = scope.querySelector('[data-filter-year]');
        var type = scope.querySelector('[data-filter-type]');
        var category = scope.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var count = scope.querySelector('[data-result-count]');
        var empty = scope.querySelector('[data-empty-state]');

        function norm(value) {
            return String(value || '').toLowerCase().trim();
        }

        function passYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }
            var cardNumber = parseInt(cardYear, 10);
            var selectedNumber = parseInt(selectedYear, 10);
            return !Number.isNaN(cardNumber) && cardNumber >= selectedNumber;
        }

        function filter() {
            var keyword = norm(input && input.value);
            var selectedRegion = norm(region && region.value);
            var selectedYear = norm(year && year.value);
            var selectedType = norm(type && type.value);
            var selectedCategory = norm(category && category.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = norm(card.dataset.title);
                var cardRegion = norm(card.dataset.region);
                var cardYear = norm(card.dataset.year);
                var cardType = norm(card.dataset.type);
                var cardCategory = norm(card.dataset.category);
                var ok = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
                    ok = false;
                }
                if (selectedType && cardType.indexOf(selectedType) === -1 && haystack.indexOf(selectedType) === -1) {
                    ok = false;
                }
                if (selectedCategory && cardCategory !== selectedCategory) {
                    ok = false;
                }
                if (!passYear(cardYear, selectedYear)) {
                    ok = false;
                }

                card.classList.toggle('hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, region, year, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });

        filter();
    });

    document.querySelectorAll('.player-frame').forEach(function (frame) {
        var video = frame.querySelector('video');
        var overlay = frame.querySelector('.player-overlay');
        var stream = frame.dataset.stream;
        var loaded = false;
        var hls = null;

        function attach() {
            if (!video || !stream || loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            loaded = true;
        }

        function play() {
            attach();
            frame.classList.add('is-playing');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            video.addEventListener('emptied', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
                hls = null;
                loaded = false;
                frame.classList.remove('is-playing');
            });
        }
    });
});

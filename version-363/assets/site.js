(function () {
    var header = document.querySelector('[data-header]');
    var navToggle = document.querySelector('[data-nav-toggle]');
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

    if (navToggle && mobileNav && header) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            header.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
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

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        showSlide(0);
        restart();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var search = scope.querySelector('.js-search');
        var yearFilter = scope.querySelector('.js-year-filter');
        var count = scope.querySelector('[data-result-count]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function updateFilter() {
            var query = normalize(search ? search.value : '');
            var year = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' '));
                var cardYear = card.getAttribute('data-year') || '';
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesYear = !year || cardYear === year;
                var shouldShow = matchesQuery && matchesYear;

                card.classList.toggle('is-hidden', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
            }
        }

        if (search) {
            search.addEventListener('input', updateFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', updateFilter);
        }
        updateFilter();
    });

    document.querySelectorAll('.js-player').forEach(function (player) {
        var button = player.querySelector('.js-play');
        var video = player.querySelector('video');
        var message = player.querySelector('[data-player-message]');
        var source = player.getAttribute('data-src');
        var hlsInstance = null;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function loadVideo() {
            if (!video || !source) {
                setMessage('当前影片缺少播放地址。');
                return Promise.resolve();
            }

            if (player.getAttribute('data-loaded') === 'true') {
                return video.play();
            }

            player.setAttribute('data-loaded', 'true');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        setMessage('浏览器阻止自动播放，请再次点击视频控制条播放。');
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放源加载失败，请检查网络或 m3u8 地址。');
                    }
                });
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return video.play();
            }

            video.src = source;
            setMessage('当前浏览器可能需要 HLS 支持才能播放 m3u8。');
            return video.play();
        }

        function startPlayback() {
            player.classList.add('is-playing');
            loadVideo().catch(function () {
                setMessage('点击视频控制条可继续播放。');
            });
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();

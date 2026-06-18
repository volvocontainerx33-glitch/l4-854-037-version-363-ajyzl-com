(function() {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    onReady(function() {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (navToggle && mobileNav) {
            navToggle.addEventListener("click", function() {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");

        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function startSlider() {
                stopSlider();
                timer = window.setInterval(function() {
                    showSlide(current + 1);
                }, 5200);
            }

            function stopSlider() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function(dot, dotIndex) {
                dot.addEventListener("click", function() {
                    showSlide(dotIndex);
                    startSlider();
                });
            });

            slider.addEventListener("mouseenter", stopSlider);
            slider.addEventListener("mouseleave", startSlider);
            showSlide(0);
            startSlider();
        }

        var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));

        filterPanels.forEach(function(panel) {
            var section = panel.closest("section") || document;
            var searchInput = panel.querySelector("[data-filter-search]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var regionSelect = panel.querySelector("[data-filter-region]");
            var items = Array.prototype.slice.call(section.querySelectorAll("[data-filter-items] .movie-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (searchInput && initialQuery) {
                searchInput.value = initialQuery;
            }

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function applyFilter() {
                var keyword = normalize(searchInput ? searchInput.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var region = normalize(regionSelect ? regionSelect.value : "");

                items.forEach(function(item) {
                    var haystack = normalize([
                        item.getAttribute("data-title"),
                        item.getAttribute("data-region"),
                        item.getAttribute("data-year"),
                        item.getAttribute("data-genre"),
                        item.getAttribute("data-tags")
                    ].join(" "));
                    var itemYear = normalize(item.getAttribute("data-year"));
                    var itemRegion = normalize(item.getAttribute("data-region"));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !year || itemYear.indexOf(year) !== -1;
                    var matchRegion = !region || itemRegion.indexOf(region) !== -1;
                    item.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchRegion));
                });
            }

            [searchInput, yearSelect, regionSelect].forEach(function(control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });

            applyFilter();
        });
    });
})();

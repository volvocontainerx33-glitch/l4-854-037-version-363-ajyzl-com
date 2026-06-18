(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function syncHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 20) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && header && mobileNav) {
      toggle.addEventListener("click", function () {
        header.classList.toggle("menu-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var hero = document.querySelector("[data-hero]");
    var heroPoster = document.querySelector("[data-hero-poster]");
    var activeSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeSlide);
      });
      var image = slides[activeSlide].getAttribute("data-image");
      if (image && hero) {
        hero.style.setProperty("--hero-image", "url('" + image + "')");
      }
      if (image && heroPoster) {
        heroPoster.style.setProperty("--hero-image", "url('" + image + "')");
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 6200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      if (!filterCards.length) {
        return;
      }
      var keyword = normalize(filterInput && filterInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      filterCards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
        var matchType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
        card.style.display = matchKeyword && matchRegion && matchType ? "" : "none";
      });
    }

    [filterInput, regionSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilter);
        element.addEventListener("change", applyFilter);
      }
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (panel) {
      var video = panel.querySelector("video");
      var button = panel.querySelector("[data-play-button]");
      var stream = panel.getAttribute("data-stream");
      var prepared = false;
      var hlsInstance = null;

      function prepare() {
        if (prepared || !video || !stream) {
          return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            backBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        if (!video) {
          return;
        }
        var promise = video.play();
        panel.classList.add("is-playing");
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            panel.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          panel.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          panel.classList.remove("is-playing");
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  });
})();

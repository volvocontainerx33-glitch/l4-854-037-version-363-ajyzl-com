(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }
    });

    document.querySelectorAll("[data-filter]").forEach(function (filter) {
      var input = filter.querySelector("[data-filter-input]");
      var year = filter.querySelector("[data-filter-year]");
      var type = filter.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";

        cards.forEach(function (card) {
          var text = [
            card.dataset.title || "",
            card.dataset.genre || "",
            card.dataset.type || "",
            card.dataset.year || ""
          ].join(" ").toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesYear = !selectedYear || card.dataset.year === selectedYear;
          var matchesType = !selectedType || card.dataset.type === selectedType;
          card.style.display = matchesQuery && matchesYear && matchesType ? "" : "none";
        });
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });

    document.querySelectorAll("[data-player]").forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("[data-play-button]");
      var source = frame.dataset.stream;
      var hls = null;

      function begin() {
        if (!video || !source) {
          return;
        }

        if (button) {
          button.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (video.getAttribute("src") !== source) {
            video.setAttribute("src", source);
          }
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hls) {
            hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            video.play().catch(function () {});
          } else {
            video.play().catch(function () {});
          }
          return;
        }

        if (video.getAttribute("src") !== source) {
          video.setAttribute("src", source);
        }
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener("click", begin);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            begin();
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });
      }
    });

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
      window.addEventListener("scroll", function () {
        backTop.classList.toggle("is-visible", window.scrollY > 400);
      });
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var results = document.querySelector("[data-search-results]");
    var searchInput = document.querySelector("[data-search-input]");
    if (results && Array.isArray(window.SEARCH_MOVIES)) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();

      if (searchInput) {
        searchInput.value = query;
      }

      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        if (!query) {
          return true;
        }
        var target = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return target.indexOf(query.toLowerCase()) !== -1;
      }).slice(0, 160);

      results.innerHTML = matched.map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="card-link" href="' + movie.href + '">',
          '<div class="card-media">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="play-hover">▶</span>',
          '<span class="score-badge">' + escapeHtml(movie.score) + '</span>',
          '</div>',
          '<div class="card-body">',
          '<h3>' + escapeHtml(movie.title) + '</h3>',
          '<p>' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
          '</div>',
          '</a>',
          '</article>'
        ].join('');
      }).join('');
    }
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();

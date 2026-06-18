(function () {
  function attachSource(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return hls;
    }

    video.src = source;
    return null;
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-player]');
    var cover = document.querySelector('[data-play-button]');
    var attached = false;
    var hlsInstance = null;

    if (!video || !cover || !source) {
      return;
    }

    function start() {
      if (!attached) {
        hlsInstance = attachSource(video, source);
        attached = true;
      }

      cover.classList.add('is-hidden');
      video.play().catch(function () {});
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };
})();

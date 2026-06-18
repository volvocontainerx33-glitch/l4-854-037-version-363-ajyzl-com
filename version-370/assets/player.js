function startMoviePlayer(source) {
  var video = document.getElementById('movieVideo');
  var layer = document.querySelector('.player-layer');
  var loaded = false;
  var hls = null;

  if (!video || !source) return;

  function bindSource() {
    if (loaded) return;
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    bindSource();
    if (layer) layer.classList.add('hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (layer) layer.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!loaded || video.paused) play();
  });
  video.addEventListener('play', function () {
    if (layer) layer.classList.add('hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') hls.destroy();
  });
}

(function() {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    onReady(function() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function(player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-overlay");

            if (!video || !button) {
                return;
            }

            var source = video.getAttribute("data-src");
            var loaded = false;
            var hlsInstance = null;

            function attachSource() {
                if (loaded || !source) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }

                loaded = true;
            }

            function startPlay() {
                attachSource();
                button.classList.add("is-hidden");
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function() {
                        button.classList.remove("is-hidden");
                    });
                }
            }

            button.addEventListener("click", startPlay);
            video.addEventListener("play", function() {
                button.classList.add("is-hidden");
            });
            video.addEventListener("pause", function() {
                if (video.currentTime === 0 || video.ended) {
                    button.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function() {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();

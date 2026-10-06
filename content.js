(function () {
    'use strict';

    // Server kontroluje délku přehrání - zrychlené video odmítne odměnu (403),
    // proto necháváme normální rychlost a video jen ztlumíme
    const RATE = 1;

    function applySettings(video) {
        if (!video.muted) video.muted = true;
        if (video.volume !== 0) video.volume = 0;
        if (video.playbackRate !== RATE) {
            try {
                video.playbackRate = RATE;
            } catch (e) {
                console.error("TravianSkip error:", e);
            }
        }
    }

    // Videa, která už sledujeme
    const seen = new WeakSet();

    function handleVideo(video) {
        if (seen.has(video)) return;
        seen.add(video);

        // Ztlumíme hned, jak se video objeví, ještě před spuštěním přehrávání
        applySettings(video);

        // Přehrávač si může rychlost/hlasitost resetovat, takže ji vždy vrátíme zpět
        ['loadedmetadata', 'play', 'playing', 'ratechange', 'volumechange'].forEach(evt => {
            video.addEventListener(evt, () => applySettings(video));
        });
    }

    // Projde dokument i otevřené shadow DOM stromy
    function scanForVideos(root) {
        root.querySelectorAll('video').forEach(handleVideo);
        root.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) scanForVideos(el.shadowRoot);
        });
    }

    const scan = () => scanForVideos(document);

    // Sledování změn v DOMu pro okamžitý záchyt nově vytvořeného videa
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement || document, { childList: true, subtree: true });

    // Pojistka pro případ, že observer něco nezachytí
    setInterval(scan, 250);
})();

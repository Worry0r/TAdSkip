(function () {
    'use strict';

    // Server kontroluje délku přehrání - zrychlené video odmítne odměnu (403),
    // proto necháváme normální rychlost
    const RATE = 1;

    // Ztlumené video prohlížeč po alt-tabu pozastaví, takže místo ztlumení
    // necháme 1% hlasitost - video pak běží dál i na pozadí
    const VOLUME = 0.01;

    function applySettings(video) {
        if (video.volume !== VOLUME) video.volume = VOLUME;
        if (video.muted) video.muted = false;
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
    const videos = new Set();

    // Videa, která mají hrát (spuštěná a nezastavená, dokud byla záložka vidět)
    const wanted = new WeakSet();

    // Chrome sám pozastaví video bez zvukové stopy ve skryté záložce,
    // takže ho na pozadí znovu spustíme. Content script vidí skutečné document.hidden.
    function resume(video) {
        if (!document.hidden || !wanted.has(video)) return;
        if (!video.paused || video.ended || !video.isConnected) return;
        video.play().catch(e => console.error("TravianSkip error:", e));
    }

    function handleVideo(video) {
        if (seen.has(video)) return;
        seen.add(video);
        videos.add(video);

        // Hlasitost nastavíme hned, jak se video objeví, ještě před spuštěním přehrávání
        applySettings(video);

        // Přehrávač si může rychlost/hlasitost resetovat, takže ji vždy vrátíme zpět
        ['loadedmetadata', 'play', 'playing', 'ratechange', 'volumechange'].forEach(evt => {
            video.addEventListener(evt, () => applySettings(video));
        });

        video.addEventListener('play', () => wanted.add(video));
        video.addEventListener('ended', () => wanted.delete(video));
        video.addEventListener('pause', () => {
            // Pauza na viditelné záložce je záměrná, na skryté ji vrátíme
            if (document.hidden) setTimeout(() => resume(video), 500);
            else wanted.delete(video);
        });
    }

    // Pojistka pro případ, že se video na pozadí pozastaví bez události
    setInterval(() => {
        videos.forEach(video => {
            if (!video.isConnected) videos.delete(video);
            else resume(video);
        });
    }, 1000);

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

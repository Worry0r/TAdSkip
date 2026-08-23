(function () {
    'use strict';

    function showNotification() {
        if (document.getElementById('travian-skip-icon')) return;

        const box = document.createElement('div');
        box.id = 'travian-skip-icon';
        
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('icon.png');
        img.style.width = '200px';
        img.style.height = '200px';
        img.style.borderRadius = '6px';
        img.style.display = 'block';

        box.appendChild(img);

        Object.assign(box.style, {
            position: 'fixed',
            top: '200px',
            left: '10px',
            backgroundColor: '#d9534f',
            padding: '8px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '9999999',
            pointerEvents: 'none',
            transition: 'opacity 0.5s ease'
        });

        document.body.appendChild(box);

        setTimeout(() => {
            box.style.opacity = '0';
            setTimeout(() => box.remove(), 500);
        }, 3000);
    }

    function handleVideo(video) {
        if (video.dataset.skipHandled) return;
        video.dataset.skipHandled = "true";

        // 1. Okamžité ztlumení ještě před spuštěním přehrávání
        video.muted = true;
        video.volume = 0;

        const executeSkip = () => {
            try {
                if (video.duration && !isNaN(video.duration) && video.duration > 0) {
                    video.currentTime = Math.max(0, video.duration - 0.1);
                }
                video.dispatchEvent(new Event('timeupdate', { bubbles: true }));
                video.dispatchEvent(new Event('ended', { bubbles: true }));
                showNotification();
            } catch (e) {
                console.error("TravianSkip error:", e);
            }
        };

        // 2. Pokus o okamžitý přeskok hned teď
        executeSkip();

        // 3. Pojistka: pokud ještě nebylo načtené `duration`, skočíme ihned jak to přehrávač dovolí
        video.addEventListener('loadedmetadata', executeSkip, { once: true });
        video.addEventListener('canplay', executeSkip, { once: true });
    }

    function scanForVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            handleVideo(video);
        });
    }

    // Sledování změn v DOMu pro okamžitý záchyt nově vytvořeného videa
    const observer = new MutationObserver(() => scanForVideos());
    observer.observe(document.body, { childList: true, subtree: true });

    // Agresivní kontrola každých 100 ms, aby k přeskočení došlo prakticky okamžitě
    setInterval(scanForVideos, 100);
})();
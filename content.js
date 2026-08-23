(function () {
    'use strict';

    function showNotification() {
        const box = document.createElement('div');
        
        // Načtení ikony z rozšíření
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('icon.png');
        img.style.width = '200px';
        img.style.height = '200px';
        img.style.borderRadius = '6px';
        img.style.display = 'block';

        box.appendChild(img);

        // Stylování okna s ikonou v levém horním rohu
        Object.assign(box.style, {
            position: 'fixed',
            top: '200px',
            left: '10px',
            backgroundColor: '#5d4fd9',
            padding: '2px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '9999999',
            pointerEvents: 'none',
            transition: 'opacity 0.5s ease'
        });

        document.body.appendChild(box);

        // Po 3 sekundách ikona zmizí
        setTimeout(() => {
            box.style.opacity = '0';
            setTimeout(() => box.remove(), 500);
        }, 3000);
    }

    function handleVideo(video) {
        if (video.dataset.skipHandled) return;
        video.dataset.skipHandled = "true";

        const skip = () => {
            // Čekání 2 vteřiny (2000 ms) před přeskočením
            setTimeout(() => {
                // 1. Přeskočení videa
                video.dispatchEvent(new Event('ended'));
                
                // 2. Zobrazení ikony
                showNotification();
            }, 2000);
        };

        if (video.readyState >= 2) {
            skip();
        } else {
            video.addEventListener('canplay', skip, { once: true });
        }
    }

    const observer = new MutationObserver(() => {
        const video = document.querySelector('#videoArea video') || document.querySelector('video');
        if (video) {
            handleVideo(video);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
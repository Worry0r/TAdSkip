(function () {
    'use strict';

    function showNotification(text) {
        const box = document.createElement('div');
        
        // Načtení ikony z rozšíření
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('icon.png');
        img.style.width = '200px';
        img.style.height = '200px';
        img.style.borderRadius = '4px';

        const textSpan = document.createElement('span');
        textSpan.innerText = text;

        box.appendChild(img);
        box.appendChild(textSpan);

        // Stylování oznamovacího okna v LEVÉM horním rohu
        Object.assign(box.style, {
            position: 'fixed',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#d9534f',
            color: '#ffffff',
            padding: '100px 160px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '9999999',
            fontSize: '160px',
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            pointerEvents: 'none',
            transition: 'opacity 0.5s ease'
        });

        document.body.appendChild(box);

        // Po 3 sekundách okno zmizí
        setTimeout(() => {
            box.style.opacity = '0';
            setTimeout(() => box.remove(), 500);
        }, 3000);
    }

    function handleVideo(video) {
        if (video.dataset.skipHandled) return;
        video.dataset.skipHandled = "true";

        const skip = () => {
            // Čekání 1 vteřinu (1000 ms) před spuštěním
            setTimeout(() => {
                // 1. Přeskočení videa
                video.dispatchEvent(new Event('ended'));
                
                // 2. Zobrazení oznámení s ikonou
                showNotification("Jsem negr");
            }, 1000);
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
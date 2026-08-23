(function () {
    'use strict';

    // Funkce pro zobrazení plovoucího oznámení
    function showNotification(text) {
        const box = document.createElement('div');
        box.innerText = text;
        
        // Stylování oznamovacího okna
        Object.assign(box.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#d9534f',
            color: '#ffffff',
            padding: '120px 200px',
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

        // Po 8 sekundách okno zmizí
        setTimeout(() => {
            box.style.opacity = '0';
            setTimeout(() => box.remove(), 500);
        }, 8000);
    }

    function handleVideo(video) {
        if (video.dataset.skipHandled) return;
        video.dataset.skipHandled = "true";

        const skip = () => {
            setTimeout(() => {
                // 1. Přeskočení videa
                video.dispatchEvent(new Event('ended'));
                
                // 2. Zobrazení oznámení na obrazovce
                showNotification("JSEM NEGR");
            }, 200);
        };

        if (video.readyState >= 2) {
            skip();
        } else {
            video.addEventListener('canplay', skip, { once: true });
        }
    }

    // Sledování změn na stránce v reálném čase
    const observer = new MutationObserver(() => {
        const video = document.querySelector('#videoArea video') || document.querySelector('video');
        if (video) {
            handleVideo(video);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
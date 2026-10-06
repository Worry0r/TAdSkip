(function () {
    'use strict';

    // Běží ve světě stránky (MAIN), aby přehrávač viděl upravené API

    // Skutečný stav viditelnosti si uložíme před přepsáním
    const realHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden').get;

    // Stránka se vždy tváří jako viditelná a aktivní
    Object.defineProperty(Document.prototype, 'hidden', {
        get: () => false,
        configurable: true
    });
    Object.defineProperty(Document.prototype, 'visibilityState', {
        get: () => 'visible',
        configurable: true
    });
    Object.defineProperty(Document.prototype, 'webkitHidden', {
        get: () => false,
        configurable: true
    });
    Object.defineProperty(Document.prototype, 'webkitVisibilityState', {
        get: () => 'visible',
        configurable: true
    });
    Document.prototype.hasFocus = () => true;

    // Zachytíme události o skrytí/ztrátě fokusu dřív, než se dostanou k přehrávači
    const block = e => {
        if (e.target === window || e.target === document) e.stopImmediatePropagation();
    };
    ['visibilitychange', 'webkitvisibilitychange', 'blur'].forEach(evt => {
        window.addEventListener(evt, block, true);
        document.addEventListener(evt, block, true);
    });

    // Pojistka: dokud je záložka skutečně skrytá, pause() ignorujeme
    const origPause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.pause = function () {
        if (realHidden.call(document)) return;
        return origPause.apply(this, arguments);
    };
})();

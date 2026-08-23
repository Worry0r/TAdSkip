chrome.runtime.onStartup.addListener(() => {
    openWelcomeWindow();
});

chrome.runtime.onInstalled.addListener(() => {
    openWelcomeWindow();
});

function openWelcomeWindow() {
    chrome.windows.create({
        url: 'welcome.html',
        type: 'popup',
        width: 800, // Výchozí šířka, javascript si ji upraví
        height: 600, // Výchozí výška
        focused: true
    });
}
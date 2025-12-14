chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    chrome.runtime.sendMessage(msg);
});

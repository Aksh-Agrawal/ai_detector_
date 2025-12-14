console.log("POPUP LOADED");

chrome.storage.local.get("lastResult", ({ lastResult }) => {
    console.log("POPUP STORAGE:", lastResult);

    const box = document.getElementById("resultBox");

    if (!lastResult) {
        box.innerText = "No detection yet.";
        return;
    }

    box.innerText =
        `AI: ${lastResult.ai}\n` +
        `Human: ${lastResult.human}`;
});

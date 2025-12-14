console.log("BACKGROUND LOADED");

const API = "http://127.0.0.1:8000";

// Register context menus at startup and install
chrome.runtime.onInstalled.addListener(createMenus);
chrome.runtime.onStartup.addListener(createMenus);

function createMenus() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "detect_text",
            title: "Detect AI (Selected Text)",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "detect_image",
            title: "Detect AI (Image)",
            contexts: ["image"]
        });

        chrome.contextMenus.create({
            id: "detect_video",
            title: "Detect AI (Video)",
            contexts: ["video"]
        });
    });
}


// HANDLE MENU CLICKS
chrome.contextMenus.onClicked.addListener(async (info, tab) => {

    console.log("MENU CLICK:", info.menuItemId, info.srcUrl);

    // ---------------------- TEXT ----------------------
    if (info.menuItemId === "detect_text") {
        const text = info.selectionText || "";
        console.log("TEXT SELECTED:", text);

        const res = await fetch(`${API}/detect/text`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const out = await res.json();
        console.log("BACKEND RESPONSE (TEXT):", out);

        chrome.storage.local.set({ lastResult: out });
        return;
    }



    // ---------------------- IMAGE ----------------------
    if (info.menuItemId === "detect_image") {
        console.log("IMAGE URL:", info.srcUrl);

        const blob = await fetch(info.srcUrl).then(r => r.blob());
        const fd = new FormData();
        fd.append("image", blob, "image.jpg");

        const res = await fetch(`${API}/detect/image`, { method: "POST", body: fd });
        const out = await res.json();

        console.log("BACKEND RESPONSE (IMAGE):", out);
        chrome.storage.local.set({ lastResult: out });
        return;
    }


    // ---------------------- VIDEO ----------------------
    if (info.menuItemId === "detect_video") {
        console.log("VIDEO URL:", info.srcUrl);

        const blob = await fetch(info.srcUrl).then(r => r.blob());
        const fd = new FormData();
        fd.append("video", blob, "video.mp4");

        const res = await fetch(`${API}/detect/video`, { method: "POST", body: fd });
        const out = await res.json();

        console.log("BACKEND RESPONSE (VIDEO):", out);
        chrome.storage.local.set({ lastResult: out });
        return;
    }

});

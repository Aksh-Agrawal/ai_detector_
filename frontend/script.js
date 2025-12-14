// Configuration
const API_URL = "http://localhost:8000";

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;

    // Update buttons
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Update content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(`${tabName}-tab`).classList.add("active");
  });
});

// Text Detection
document.getElementById("text-btn").addEventListener("click", async () => {
  const text = document.getElementById("text-input").value.trim();
  const resultBox = document.getElementById("text-result");
  const btn = document.getElementById("text-btn");

  if (!text) {
    showError(resultBox, "Please enter some text to analyze.");
    return;
  }

  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/detect/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("Detection failed");

    const data = await response.json();
    showResult(resultBox, data);
  } catch (error) {
    showError(resultBox, "Error: " + error.message);
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
});

// Image Detection
let selectedImage = null;

document.getElementById("image-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedImage = file;
    const preview = document.getElementById("image-preview");
    const reader = new FileReader();

    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };

    reader.readAsDataURL(file);
    document.getElementById("image-btn").disabled = false;
  }
});

document.getElementById("image-btn").addEventListener("click", async () => {
  if (!selectedImage) return;

  const resultBox = document.getElementById("image-result");
  const btn = document.getElementById("image-btn");

  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const formData = new FormData();
    formData.append("image", selectedImage);

    const response = await fetch(`${API_URL}/detect/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Detection failed");

    const data = await response.json();
    showResult(resultBox, data);
  } catch (error) {
    showError(resultBox, "Error: " + error.message);
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
});

// Video Detection
let selectedVideo = null;

document.getElementById("video-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedVideo = file;
    const preview = document.getElementById("video-preview");
    const url = URL.createObjectURL(file);

    preview.innerHTML = `<video src="${url}" controls></video>`;
    document.getElementById("video-btn").disabled = false;
  }
});

document.getElementById("video-btn").addEventListener("click", async () => {
  if (!selectedVideo) return;

  const resultBox = document.getElementById("video-result");
  const btn = document.getElementById("video-btn");

  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const formData = new FormData();
    formData.append("video", selectedVideo);

    const response = await fetch(`${API_URL}/detect/video`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Detection failed");

    const data = await response.json();
    showResult(resultBox, data, data.frame_count);
  } catch (error) {
    showError(resultBox, "Error: " + error.message);
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
});

// Helper Functions
function showResult(container, data, frameCount = null) {
  const aiPercent = (data.ai * 100).toFixed(1);
  const humanPercent = (data.human * 100).toFixed(1);
  const isAI = data.ai > data.human;

  container.innerHTML = `
        <div class="result-header" style="color: ${
          isAI ? "#e03131" : "#37b24d"
        }">
            ${isAI ? "🤖 AI Generated" : "👤 Human Created"}
        </div>
        <div class="progress-bars">
            <div class="progress-item">
                <div class="progress-label">
                    <span>🤖 AI</span>
                    <span>${aiPercent}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ai-fill" style="width: ${aiPercent}%"></div>
                </div>
            </div>
            <div class="progress-item">
                <div class="progress-label">
                    <span>👤 Human</span>
                    <span>${humanPercent}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill human-fill" style="width: ${humanPercent}%"></div>
                </div>
            </div>
        </div>
        ${
          frameCount
            ? `<div class="frame-info">Analyzed ${frameCount} frames</div>`
            : ""
        }
    `;

  container.classList.add("show");
}

function showError(container, message) {
  container.innerHTML = `
        <div class="error-box">
            <strong>❌ Error:</strong> ${message}
        </div>
    `;
  container.classList.add("show");
}

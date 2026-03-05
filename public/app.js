const form = document.querySelector("#clip-form");
const status = document.querySelector("#status");
const clipsContainer = document.querySelector("#clips");
const resultsSection = document.querySelector("#results");

function setStatus(message, type = "info") {
  status.textContent = message;
  status.dataset.type = type;
}

function renderClips(clips) {
  clipsContainer.innerHTML = "";

  if (!clips.length) {
    clipsContainer.innerHTML = "<p>No hay clips disponibles.</p>";
    return;
  }

  clips.forEach((clip, index) => {
    const card = document.createElement("article");
    card.className = "clip-card";

    const video = document.createElement("video");
    video.controls = true;
    video.src = clip.url;

    const meta = document.createElement("p");
    meta.className = "clip-meta";
    meta.textContent = `Clip ${index + 1}: desde ${clip.start.toFixed(1)}s durante ${clip.duration.toFixed(1)}s.`;

    const actions = document.createElement("div");
    actions.className = "clip-actions";
    const link = document.createElement("a");
    link.href = clip.url;
    link.download = "";
    link.textContent = "Descargar";
    actions.appendChild(link);

    card.append(video, meta, actions);
    clipsContainer.appendChild(card);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Procesando video...", "loading");
  resultsSection.scrollIntoView({ behavior: "smooth" });

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;

  try {
    const formData = new FormData(form);
    const response = await fetch("/api/extract", {
      method: "POST",
      body: formData
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Error desconocido.");
    }

    setStatus(`Listo: ${payload.clips.length} clips generados.`, "success");
    renderClips(payload.clips);
  } catch (error) {
    setStatus(error.message, "error");
    clipsContainer.innerHTML = "";
  } finally {
    submitButton.disabled = false;
  }
});

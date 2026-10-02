const audioPlayer = document.querySelector("#track-audio");
const musicCard = document.querySelector(".music-card");
const trackTitle = document.querySelector("#track-title");
const trackArtist = document.querySelector("#track-artist");
const trackStatus = document.querySelector("#track-status");
const progressBar = document.querySelector("#track-progress");
const currentTimeLabel = document.querySelector("#track-current");
const durationLabel = document.querySelector("#track-duration");
const toggleButton = document.querySelector("#track-toggle");
const letter = document.querySelector("#birthday-letter");
const envelopeButton = document.querySelector("#envelope-button");
const birthdayMessage = document.querySelector("#birthday-message");
const goodThings = document.querySelector("#good-things");
const loveScene = document.querySelector("#love-scene");
const closingNote = document.querySelector("#closing-note");

audioPlayer.volume = 0.6;

const letterParagraphs = Array.from(birthdayMessage.querySelectorAll("p"), (paragraph) => ({
    paragraph,
    text: paragraph.textContent.trim().replace(/\s+/g, " ")
}));

async function typeLetterContent() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        revealLoveScene();
        revealGoodThings();
        return;
    }

    for (const { paragraph } of letterParagraphs) {
        paragraph.textContent = "";
    }

    await new Promise((resolve) => window.setTimeout(resolve, 500));

    for (const { paragraph, text } of letterParagraphs) {
        paragraph.classList.add("is-typing-line");

        for (const character of Array.from(text)) {
            paragraph.textContent += character;
            await new Promise((resolve) => window.setTimeout(resolve, 14));
        }

        paragraph.classList.remove("is-typing-line");

        if (paragraph.textContent === "Note") {
            revealLoveScene();
        }

        await new Promise((resolve) => window.setTimeout(resolve, 180));
    }

    revealGoodThings();
}

function revealLoveScene() {
    loveScene.hidden = false;
    loveScene.classList.add("is-visible");
}

function revealGoodThings() {
    goodThings.hidden = false;
    goodThings.classList.add("is-visible");
    closingNote.hidden = false;
}

envelopeButton.addEventListener("click", () => {
    if (letter.classList.contains("is-open")) return;

    letter.classList.add("is-open");
    document.body.classList.add("page-unlocked");
    envelopeButton.setAttribute("aria-expanded", "true");
    envelopeButton.setAttribute("aria-label", "Surat ulang tahun telah dibuka");
    birthdayMessage.hidden = false;
    birthdayMessage.setAttribute("aria-hidden", "false");
    typeLetterContent();
});

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
}

function resumePlayback() {
    audioPlayer.play().catch(() => {});
}

toggleButton.addEventListener("click", async () => {
    if (audioPlayer.paused) {
        try {
            await audioPlayer.play();
        } catch {
            trackStatus.textContent = "Audio tidak dapat diputar";
        }
    } else {
        audioPlayer.pause();
    }
});

function resumePlaybackFromPage(event) {
    if (event.target.closest?.("#track-toggle")) return;
    resumePlayback();
}

audioPlayer.addEventListener("loadedmetadata", () => {
    progressBar.max = audioPlayer.duration || 0;
    durationLabel.textContent = formatTime(audioPlayer.duration);
    audioPlayer.play().catch((error) => {
        if (error.name === "NotAllowedError") {
            trackStatus.textContent = "Sentuh halaman untuk memulai musik";
            document.addEventListener("pointerdown", resumePlaybackFromPage);
            document.addEventListener("keydown", resumePlaybackFromPage);
        } else {
            trackStatus.textContent = "Audio tidak dapat diputar";
        }
    });
});

audioPlayer.addEventListener("timeupdate", () => {
    progressBar.value = audioPlayer.currentTime;
    currentTimeLabel.textContent = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener("play", () => {
    trackStatus.textContent = "Sedang diputar";
    musicCard.classList.add("is-playing");
    toggleButton.setAttribute("aria-label", "Jeda lagu");
    toggleButton.setAttribute("title", "Jeda lagu");
    document.removeEventListener("pointerdown", resumePlaybackFromPage);
    document.removeEventListener("keydown", resumePlaybackFromPage);
});

audioPlayer.addEventListener("pause", () => {
    musicCard.classList.remove("is-playing");
    trackStatus.textContent = "Dijeda";
    toggleButton.setAttribute("aria-label", "Putar lagu");
    toggleButton.setAttribute("title", "Putar lagu");
});

audioPlayer.addEventListener("ended", () => {
    trackStatus.textContent = "Lagu selesai";
    musicCard.classList.remove("is-playing");
    toggleButton.setAttribute("aria-label", "Putar lagu");
    toggleButton.setAttribute("title", "Putar lagu");
});

audioPlayer.addEventListener("error", () => {
    trackStatus.textContent = "Audio tidak dapat dimuat";
});

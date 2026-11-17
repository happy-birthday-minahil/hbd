/* Birthday surprise interactions */
const $ = (id) => document.getElementById(id);
const SETTINGS = {
  birthday: { day: 1, month: 1, year: 2010 },
  music: "assets/birthday-music.mp3",
  birthdayVideo: "assets/happy-birthday-video.mp4",
  photos: Array.from({ length: 14 }, (_, i) => `photo${i + 1}.jpg`),
  videos: Array.from({ length: 7 }, (_, i) => `video${i + 1}.mp4`)
};
const pages = ["gate-page", "intro-page", "cake-page", "birthday-video-page", "gift-invite-page", "gifts-page", "memories-page"];
let blownCandles = 0, isCut = false, dragStartX = 0, dragCurrentX = 0, dragging = false;
const music = $("birthday-music"), birthdayVideo = $("birthday-video"), musicToggle = $("music-toggle");
let musicEnabled = true, musicPosition = 0, activeVideo = null;

for (let y = 2001; y <= 2027; y++) {
  const option = document.createElement("option"); option.value = String(y); option.textContent = String(y); $("year").appendChild(option);
}
function showPage(id) { pages.forEach((pageId) => $(pageId).classList.toggle("active", pageId === id)); window.scrollTo({ top: 0, behavior: "instant" }); }
function toast(message) { const el = $("toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 3000); }
function syncMusicButton() {
  musicToggle.textContent = musicEnabled ? "♫ Music: ON" : "♫ Music: OFF";
  musicToggle.setAttribute("aria-pressed", String(musicEnabled));
  musicToggle.setAttribute("aria-label", musicEnabled ? "Turn background music off" : "Turn background music on");
}
function startBirthdayMusic() {
  if (!musicEnabled || activeVideo) return;
  music.volume = 0.58;
  music.play().catch(() => { /* The reveal-cake tap is the user gesture that normally permits playback. */ });
}
function pauseMusicForVideo() {
  if (!music.paused) musicPosition = music.currentTime;
  music.pause();
}
function resumeMusicAfterVideo() {
  if (!musicEnabled || activeVideo) return;
  try { music.currentTime = musicPosition; } catch (_) {}
  startBirthdayMusic();
}
musicToggle.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  if (musicEnabled) startBirthdayMusic(); else music.pause();
  syncMusicButton();
});
syncMusicButton();

$("birth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const day = Number($("day").value), month = Number($("month").value), year = Number($("year").value);
  const date = new Date(year, month - 1, day);
  const valid = day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2001 && year <= 2027 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!valid) { $("date-error").textContent = "Please choose a valid day, month and year."; return; }
  if (day !== SETTINGS.birthday.day || month !== SETTINGS.birthday.month || year !== SETTINGS.birthday.year) { $("date-error").textContent = "That date doesn't unlock this surprise. Try again!"; return; }
  $("date-error").textContent = ""; showPage("intro-page");
});
$("reveal-cake").addEventListener("click", () => { showPage("cake-page"); startBirthdayMusic(); });
function makeConfetti(amount = 72) {
  const colors = ["#ffcf73", "#ff79df", "#b18cff", "#fff4d8", "#ff8fae"];
  for (let i = 0; i < amount; i++) { const piece = document.createElement("i"); piece.className = "confetti-piece"; piece.style.left = `${Math.random() * 100}%`; piece.style.background = colors[i % colors.length]; piece.style.setProperty("--fall-x", `${(Math.random() - 0.5) * 240}px`); piece.style.setProperty("--fall-r", `${Math.random() * 900 - 450}deg`); piece.style.animationDelay = `${Math.random() * 0.55}s`; piece.style.animationDuration = `${2.1 + Math.random() * 1.4}s`; document.body.appendChild(piece); setTimeout(() => piece.remove(), 4300); }
}
const candles = [...document.querySelectorAll(".candle")];
candles.forEach((candle) => candle.addEventListener("click", () => {
  if (candle.classList.contains("blown") || blownCandles >= 3) return;
  candle.classList.add("blown"); blownCandles++; const left = 3 - blownCandles;
  $("cake-hint").textContent = left ? `TAP THE CANDLES · ${left} LEFT` : "ALL THREE CANDLES ARE OUT!";
  $("cake-subhint").textContent = left ? "Tap the remaining candle" : "Now drag the hand across the cake";
  if (!left) { $("instruction-finger").classList.add("hidden"); $("knife-hand").classList.remove("hidden"); $("knife-hand").classList.add("hand-ready"); $("cake-instruction").classList.add("cut-instruction"); }
}));
function finishCakeCut() {
  if (isCut || blownCandles !== 3) return; isCut = true; $("knife-hand").classList.add("hidden"); $("cake-art").classList.add("cake-is-cut"); $("cake-cut-line").classList.add("visible"); $("cake-instruction").classList.add("hidden"); $("cake-heading").classList.add("hidden");
  setTimeout(() => { $("cake-celebration").classList.remove("hidden"); makeConfetti(110); }, 700);
}
const knifeHand = $("knife-hand");
knifeHand.addEventListener("pointerdown", (event) => { if (isCut || blownCandles !== 3) return; dragging = true; dragStartX = event.clientX; dragCurrentX = 0; knifeHand.classList.add("dragging"); knifeHand.setPointerCapture(event.pointerId); event.preventDefault(); });
knifeHand.addEventListener("pointermove", (event) => { if (!dragging) return; dragCurrentX = event.clientX - dragStartX; knifeHand.style.setProperty("--drag-x", `${Math.max(-24, Math.min(240, dragCurrentX))}px`); if (Math.abs(dragCurrentX) > 115) finishCakeCut(); });
function stopDrag() { if (!dragging) return; dragging = false; knifeHand.classList.remove("dragging"); if (!isCut) knifeHand.style.setProperty("--drag-x", "0px"); }
knifeHand.addEventListener("pointerup", stopDrag); knifeHand.addEventListener("pointercancel", stopDrag);
knifeHand.addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && blownCandles === 3) { event.preventDefault(); finishCakeCut(); } });

$("cake-next").addEventListener("click", () => {
  showPage("birthday-video-page"); $("video-next").classList.add("hidden"); $("birthday-video-note").textContent = "Your special birthday video is ready.";
  birthdayVideo.currentTime = 0; birthdayVideo.play().catch(() => { $("birthday-video-note").textContent = "Tap the video play control to start your birthday video."; });
});
function handleVideoPlay(video) {
  if (activeVideo && activeVideo !== video) { activeVideo.pause(); }
  activeVideo = video; pauseMusicForVideo();
  document.querySelectorAll(".memory-video-card video").forEach((other) => { if (other !== video) other.pause(); });
  if (birthdayVideo !== video) birthdayVideo.pause();
}
function handleVideoStop(video) {
  if (activeVideo === video) activeVideo = null;
  if (!activeVideo) resumeMusicAfterVideo();
}
birthdayVideo.addEventListener("play", () => handleVideoPlay(birthdayVideo));
birthdayVideo.addEventListener("pause", () => handleVideoStop(birthdayVideo));
birthdayVideo.addEventListener("ended", () => { handleVideoStop(birthdayVideo); $("video-next").classList.remove("hidden"); $("birthday-video-note").textContent = "That was made just for you. Your next surprise is waiting!"; makeConfetti(45); });
birthdayVideo.addEventListener("error", () => { $("birthday-video-note").textContent = "Video load nahi hui. Check karein ke happy-birthday-video.mp4 assets folder ke andar directly maujood hai."; });
$("video-next").addEventListener("click", () => { birthdayVideo.pause(); showPage("gift-invite-page"); });
$("open-gifts-page").addEventListener("click", () => { showPage("gifts-page"); makeConfetti(55); });

const gifts = [
  { image: "assets/bmw-m4.png", alt: "Blue BMW M4 car", title: "Your Dream BMW M4!", text: "A little dream ride for someone who deserves the very best. May every road ahead bring you happiness." },
  { image: "assets/teddy-bear.png", alt: "Teddy bear holding a heart", title: "A Teddy Bear Hug", text: "A soft little friend to remind you that you are loved and appreciated." },
  { image: "assets/flowers.png", alt: "Bouquet of red roses", title: "Flowers for Minalhil", text: "A beautiful bouquet to make your birthday brighter, with a wish for a thousand happy days." },
  { image: "assets/chocolate.png", alt: "Luxury chocolate gift box", title: "Sweet Chocolates", text: "A little box of sweetness, because your special day deserves an extra treat." }
];
let currentGift = 0;
$("open-single-gift").addEventListener("click", () => {
  const gift = gifts[currentGift]; $("gift-image").src = gift.image; $("gift-image").alt = gift.alt; $("gift-title").textContent = gift.title; $("gift-text").textContent = gift.text;
  $("single-gift-reveal").classList.remove("hidden"); $("open-single-gift").classList.add("hidden"); $("gift-next").classList.remove("hidden"); makeConfetti(45);
});
$("gift-next").addEventListener("click", () => {
  currentGift++;
  if (currentGift >= gifts.length) { $("gift-next").classList.add("hidden"); $("gift-finish").classList.remove("hidden"); return; }
  $("single-gift-reveal").classList.add("hidden"); $("open-single-gift").classList.remove("hidden"); $("gift-step-label").textContent = `Gift ${currentGift + 1} of 4 · Tap the gift to open it.`; makeConfetti(22);
});
$("to-memories").addEventListener("click", () => { showPage("memories-page"); music.volume = 0.42; });

const photoGrid = $("photo-grid");
SETTINGS.photos.forEach((filename, index) => { const img = document.createElement("img"); img.src = `assets/${filename}`; img.alt = `Minalhil memory ${index + 1}`; img.loading = "lazy"; img.addEventListener("error", () => { img.closest(".photo-card")?.classList.add("missing"); }); const card = document.createElement("button"); card.className = "photo-card"; card.type = "button"; card.setAttribute("aria-label", `Open photo ${index + 1}`); card.appendChild(img); card.addEventListener("click", () => { if (!img.naturalWidth) return; $("photo-viewer-image").src = img.src; $("photo-viewer").classList.remove("hidden"); }); photoGrid.appendChild(card); });
const memoryVideoGrid = $("memory-video-grid");
SETTINGS.videos.forEach((filename, index) => { const card = document.createElement("article"); card.className = "memory-video-card glass"; const video = document.createElement("video"); video.src = `assets/${filename}`; video.controls = true; video.playsInline = true; video.preload = "metadata"; video.setAttribute("controlsList", "nodownload noplaybackrate"); video.setAttribute("disablePictureInPicture", ""); video.setAttribute("disableRemotePlayback", ""); video.setAttribute("aria-label", `Memory video ${index + 1}`); video.addEventListener("play", () => handleVideoPlay(video)); video.addEventListener("pause", () => handleVideoStop(video)); video.addEventListener("ended", () => handleVideoStop(video)); video.addEventListener("error", () => { card.classList.add("missing"); }); const label = document.createElement("p"); label.textContent = `Memory ${String(index + 1).padStart(2, "0")}`; card.append(video, label); memoryVideoGrid.appendChild(card); });
function closePhotoViewer() { $("photo-viewer").classList.add("hidden"); $("photo-viewer-image").src = ""; }
$("close-photo-viewer").addEventListener("click", closePhotoViewer);
$("photo-viewer").addEventListener("click", (event) => { if (event.target === $("photo-viewer")) closePhotoViewer(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closePhotoViewer(); });


/* Basic media-save deterrents (not DRM; cannot guarantee protection). */
document.addEventListener("contextmenu", (event) => {
  if (event.target.closest("img, video")) event.preventDefault();
});
document.addEventListener("dragstart", (event) => {
  if (event.target.closest("img, video")) event.preventDefault();
});
document.querySelectorAll("img, video").forEach((media) => {
  media.setAttribute("draggable", "false");
});

/* Manahil's Birthday Surprise — all steps are separate pages. */
const $ = (id) => document.getElementById(id);
const SETTINGS = {
  birthday: { day: 1, month: 1, year: 2010 },
  music: "assets/music/birthday-music.mp3",
  birthdayVideo: "assets/videos/happy-birthday-video.mp4",
  photos: Array.from({ length: 12 }, (_, i) => `photo${i + 1}.jpg`),
  videos: Array.from({ length: 5 }, (_, i) => `video${i + 1}.mp4`)
};

const pages = ["gate-page", "intro-page", "cake-page", "birthday-video-page", "gift-invite-page", "gifts-page", "memories-page"];
let blownCandles = 0;
let isCut = false;
let dragStartX = 0;
let dragCurrentX = 0;
let dragging = false;
const music = $("birthday-music");
const birthdayVideo = $("birthday-video");

for (let y = 2001; y <= 2027; y++) {
  const option = document.createElement("option");
  option.value = String(y);
  option.textContent = String(y);
  $("year").appendChild(option);
}

function showPage(id) {
  pages.forEach((pageId) => $(pageId).classList.toggle("active", pageId === id));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 3000);
}

function startBirthdayMusic() {
  music.volume = 0.58;
  music.play().catch(() => {
    // Browsers may block media until a gesture. Retry on the next real tap,
    // without adding a separate music-play button to the page.
    const retry = () => {
      if (music.paused) music.play().catch(() => {});
      if (!music.paused) document.removeEventListener("pointerdown", retry);
    };
    document.addEventListener("pointerdown", retry);
  });
}

$("birth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const day = Number($("day").value);
  const month = Number($("month").value);
  const year = Number($("year").value);
  const date = new Date(year, month - 1, day);
  const valid = day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2001 && year <= 2027 &&
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  if (!valid) {
    $("date-error").textContent = "Please choose a valid day, month and year.";
    return;
  }
  if (day !== SETTINGS.birthday.day || month !== SETTINGS.birthday.month || year !== SETTINGS.birthday.year) {
    $("date-error").textContent = "That date doesn't unlock this surprise. Try again!";
    return;
  }
  $("date-error").textContent = "";
  showPage("intro-page");
});

// The music begins at the same moment the cake is revealed.
$("reveal-cake").addEventListener("click", () => {
  showPage("cake-page");
  startBirthdayMusic();
});

function makeConfetti(amount = 72) {
  const colors = ["#ffcf73", "#ff79df", "#b18cff", "#fff4d8", "#ff8fae"];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--fall-x", `${(Math.random() - 0.5) * 240}px`);
    piece.style.setProperty("--fall-r", `${Math.random() * 900 - 450}deg`);
    piece.style.animationDelay = `${Math.random() * 0.55}s`;
    piece.style.animationDuration = `${2.1 + Math.random() * 1.4}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4300);
  }
}

const candles = [...document.querySelectorAll(".candle")];
candles.forEach((candle) => {
  candle.addEventListener("click", () => {
    if (candle.classList.contains("blown") || blownCandles >= 3) return;
    candle.classList.add("blown");
    blownCandles++;
    const left = 3 - blownCandles;
    $("cake-hint").textContent = left ? `TAP THE CANDLES · ${left} LEFT` : "ALL THREE CANDLES ARE OUT!";
    $("cake-subhint").textContent = left ? "Tap the remaining candle" : "Now drag the hand across the cake";
    if (left === 0) {
      $("instruction-finger").classList.add("hidden");
      $("knife-hand").classList.remove("hidden");
      $("knife-hand").classList.add("hand-ready");
      $("cake-instruction").classList.add("cut-instruction");
    }
  });
});

function finishCakeCut() {
  if (isCut || blownCandles !== 3) return;
  isCut = true;
  $("knife-hand").classList.add("hidden");
  $("cake-art").classList.add("cake-is-cut");
  $("cake-cut-line").classList.add("visible");
  $("cake-instruction").classList.add("hidden");
  $("cake-heading").classList.add("hidden");
  setTimeout(() => {
    $("cake-celebration").classList.remove("hidden");
    makeConfetti(110);
  }, 700);
}

const knifeHand = $("knife-hand");
knifeHand.addEventListener("pointerdown", (event) => {
  if (isCut || blownCandles !== 3) return;
  dragging = true;
  dragStartX = event.clientX;
  dragCurrentX = 0;
  knifeHand.classList.add("dragging");
  knifeHand.setPointerCapture(event.pointerId);
  event.preventDefault();
});
knifeHand.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  dragCurrentX = event.clientX - dragStartX;
  const clamped = Math.max(-24, Math.min(240, dragCurrentX));
  knifeHand.style.setProperty("--drag-x", `${clamped}px`);
  if (Math.abs(dragCurrentX) > 115) finishCakeCut();
});
function stopDrag() {
  if (!dragging) return;
  dragging = false;
  knifeHand.classList.remove("dragging");
  if (!isCut) knifeHand.style.setProperty("--drag-x", "0px");
}
knifeHand.addEventListener("pointerup", stopDrag);
knifeHand.addEventListener("pointercancel", stopDrag);
knifeHand.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && blownCandles === 3) {
    event.preventDefault();
    finishCakeCut();
  }
});

$("cake-next").addEventListener("click", () => {
  showPage("birthday-video-page");
  birthdayVideo.currentTime = 0;
  birthdayVideo.play().catch(() => {
    $("birthday-video-note").textContent = "Tap the video play control if your browser doesn't start it automatically.";
  });
});

birthdayVideo.addEventListener("ended", () => {
  $("video-next").classList.remove("hidden");
  $("birthday-video-note").textContent = "That was made just for you. Your next surprise is waiting!";
  makeConfetti(45);
});
birthdayVideo.addEventListener("error", () => {
  $("birthday-video-note").textContent = "Video not found. Check that happy-birthday-video.mp4 is inside assets/videos.";
  $("video-next").classList.remove("hidden");
});
$("video-next").addEventListener("click", () => {
  birthdayVideo.pause();
  showPage("gift-invite-page");
});
$("open-gifts-page").addEventListener("click", () => {
  showPage("gifts-page");
  makeConfetti(55);
});

const giftDetails = {
  bmw: { art: "🚘", title: "Your Dream BMW M4!", text: "A little dream ride for someone who deserves the very best. May every road ahead bring you happiness." },
  flowers: { art: "💐", title: "Flowers for Manahil", text: "A beautiful bouquet to make your birthday brighter, with a wish for a thousand happy days." },
  bear: { art: "🧸", title: "A Teddy Bear Hug", text: "A soft little friend to remind you that you are loved and appreciated." },
  heart: { art: "💝", title: "A Sweet Note", text: "You make ordinary moments feel special. Keep smiling and keep shining, Manahil!" },
  crown: { art: "👑", title: "The Birthday Crown", text: "Today is your day. Wear your invisible crown and enjoy every little moment." },
  stars: { art: "🌟", title: "A Pocket Full of Stars", text: "May your wishes find their way to you, one beautiful star at a time." },
  balloons: { art: "🎈", title: "A Sky Full of Balloons", text: "Sending you bright colors, happy surprises and lots of birthday cheer." },
  cake: { art: "🍰", title: "One More Sweet Treat", text: "Because one birthday cake is never quite enough. Save a little sweetness for yourself!" }
};

document.querySelectorAll(".gift-box-card").forEach((button) => {
  button.addEventListener("click", () => {
    const gift = giftDetails[button.dataset.gift];
    if (!gift) return;
    document.querySelectorAll(".gift-box-card").forEach((card) => card.classList.remove("selected"));
    button.classList.add("selected", "opened");
    $("gift-reveal-art").textContent = gift.art;
    $("gift-reveal-title").textContent = gift.title;
    $("gift-reveal-text").textContent = gift.text;
    $("gift-reveal").classList.remove("hidden");
    makeConfetti(38);
    $("gift-reveal").scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
$("close-reveal").addEventListener("click", () => $("gift-reveal").classList.add("hidden"));
$("to-memories").addEventListener("click", () => {
  showPage("memories-page");
  music.volume = 0.42;
});

// Load all requested memories using the exact filenames supplied.
const photoGrid = $("photo-grid");
SETTINGS.photos.forEach((filename, index) => {
  const img = document.createElement("img");
  img.src = `assets/images/${filename}`;
  img.alt = `Manahil memory ${index + 1}`;
  img.loading = "lazy";
  img.addEventListener("error", () => { img.closest(".photo-card")?.classList.add("missing"); });
  const card = document.createElement("button");
  card.className = "photo-card";
  card.type = "button";
  card.setAttribute("aria-label", `Open photo ${index + 1}`);
  card.appendChild(img);
  card.addEventListener("click", () => {
    if (!img.naturalWidth) return;
    $("photo-viewer-image").src = img.src;
    $("photo-viewer").classList.remove("hidden");
  });
  photoGrid.appendChild(card);
});

const memoryVideoGrid = $("memory-video-grid");
SETTINGS.videos.forEach((filename, index) => {
  const card = document.createElement("article");
  card.className = "memory-video-card glass";
  const video = document.createElement("video");
  video.src = `assets/videos/${filename}`;
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-label", `Memory video ${index + 1}`);
  video.addEventListener("error", () => { card.classList.add("missing"); });
  const label = document.createElement("p");
  label.textContent = `Memory ${String(index + 1).padStart(2, "0")}`;
  card.append(video, label);
  memoryVideoGrid.appendChild(card);
});

function closePhotoViewer() { $("photo-viewer").classList.add("hidden"); $("photo-viewer-image").src = ""; }
$("close-photo-viewer").addEventListener("click", closePhotoViewer);
$("photo-viewer").addEventListener("click", (event) => { if (event.target === $("photo-viewer")) closePhotoViewer(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closePhotoViewer(); });

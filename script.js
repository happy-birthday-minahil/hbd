// PERSONALIZE THIS FILE: set the private code and add your media filenames below.
const SETTINGS = {
  // Change this to the special code you choose for Manahil.
  favoriteCode: "CHANGE-ME",
  // Manahil's birthday: 1 January 2010
  birthday: { day: 1, month: 1, year: 2010 },
  photos: [], // Example: ["photo1.jpg", "photo2.jpg"]
  videos: []  // Example: ["video1.mp4"]
};

const daySelect = document.getElementById("day");
const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");
for (let d=1; d<=31; d++) daySelect.add(new Option(String(d).padStart(2,"0"), d));
for (let y=2001; y<=2027; y++) yearSelect.add(new Option(y, y));
const gateMessage = document.getElementById("gateMessage");
const toast = document.getElementById("toast");
function notify(message){ toast.textContent=message; toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),2600); }

document.getElementById("unlock").addEventListener("click",()=>{
  const day=Number(daySelect.value), month=Number(monthSelect.value), year=Number(yearSelect.value);
  if(!day || !month || !year){gateMessage.textContent="Please choose your day, month and year.";return;}
  const chosen=new Date(year,month-1,day);
  if(chosen.getFullYear()!==year || chosen.getMonth()!==month-1 || chosen.getDate()!==day){gateMessage.textContent="That date is not valid. Please check it.";return;}
  if(day!==SETTINGS.birthday.day || month!==SETTINGS.birthday.month || year!==SETTINGS.birthday.year){
    gateMessage.textContent="That date doesn't unlock this surprise. Try again.";return;
  }
  document.getElementById("gate").classList.add("hidden");
  document.getElementById("celebration").classList.remove("hidden");
  confetti();
});
document.querySelectorAll(".candle").forEach((candle)=>{
  candle.addEventListener("click",(event)=>{
    event.stopPropagation();
    candle.classList.add("off");
    const index=[...document.querySelectorAll(".candle")].indexOf(candle);
    document.querySelectorAll(".flame")[index].classList.add("out");
    if(document.querySelectorAll(".candle.off").length===3){
      document.getElementById("cakeHint").textContent="Wish made! Now it's time to cut the cake ✨";
    }
  });
});
document.getElementById("cutCake").addEventListener("click",()=>{
  document.getElementById("cake").classList.add("cut");
  document.getElementById("cutMessage").textContent="A slice of happiness, just for you! 🎂";
  confetti();
});
document.getElementById("openGift").addEventListener("click",()=>{
  document.getElementById("giftReveal").classList.toggle("hidden");
  confetti();
});
document.getElementById("showMemories").addEventListener("click",()=>{
  const area=document.getElementById("memories");area.classList.toggle("hidden");
  if(!area.classList.contains("hidden")) area.scrollIntoView({behavior:"smooth",block:"start"});
});
function confetti(){
  for(let i=0;i<34;i++){
    const bit=document.createElement("span");bit.textContent=["✦","♥","✧","•"][i%4];
    Object.assign(bit.style,{position:"fixed",left:Math.random()*100+"vw",top:"-20px",zIndex:10,
      color:["#f5d99a","#f5a9c7","#ffffff"][i%3],fontSize:(12+Math.random()*17)+"px",
      transition:"transform 2.2s ease,opacity 2.2s ease",pointerEvents:"none"});
    document.body.appendChild(bit);
    requestAnimationFrame(()=>{bit.style.transform=`translateY(${65+Math.random()*75}vh) rotate(${Math.random()*540}deg)`;bit.style.opacity="0";});
    setTimeout(()=>bit.remove(),2400);
  }
}
function loadMedia(){
  const photos=document.getElementById("photoGrid"), videos=document.getElementById("videoGrid");
  if(SETTINGS.photos.length){photos.innerHTML="";SETTINGS.photos.forEach(file=>{const img=document.createElement("img");img.src=`assets/images/${file}`;img.alt="A special memory";img.loading="lazy";photos.appendChild(img);});}
  if(SETTINGS.videos.length){videos.innerHTML="";SETTINGS.videos.forEach(file=>{const video=document.createElement("video");video.src=`assets/videos/${file}`;video.controls=true;video.preload="metadata";videos.appendChild(video);});}
}
loadMedia();

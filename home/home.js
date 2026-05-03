// home.js - JS slider (smooth single-slide transition), dots and nav

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.getElementById("slider");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const dotsContainer = document.getElementById("dots");

  let index = 0;
  const total = slides.length;
  let timer = null;
  const AUTO_DELAY = 4500;

  // create dots
  for (let i = 0; i < total; i++) {
    const btn = document.createElement("button");
    btn.addEventListener("click", () => {
      goTo(i);
      resetTimer();
    });
    dotsContainer.appendChild(btn);
  }

  const dots = Array.from(dotsContainer.children);

  function update() {
    const offset = -index * 100;
    slider.style.transform = `translateX(${offset}%)`;
    dots.forEach((d) => d.classList.remove("active"));
    if (dots[index]) dots[index].classList.add("active");
  }

  function goTo(i) {
    index = (i + total) % total;
    update();
  }

  function next() {
    goTo(index + 1);
  }
  function prev() {
    goTo(index - 1);
  }

  function startTimer() {
    timer = setInterval(next, AUTO_DELAY);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  // wire buttons
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); resetTimer(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); resetTimer(); });

  // initial
  update();
  startTimer();

  // pause on hover + resume
  const wrapper = document.querySelector(".slideshow-wrapper");
  if (wrapper) {
    wrapper.addEventListener("mouseenter", () => clearInterval(timer));
    wrapper.addEventListener("mouseleave", () => startTimer());
  }
});

(() => {
  // reuse same tilt logic
  const tiltEls = document.querySelectorAll('[data-tilt]');
  tiltEls.forEach(el=>{
    el.addEventListener('mousemove', e=>{
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width/2;
      const cy = rect.height/2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const rx = dy * 6;
      const ry = dx * -8;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    });
    el.addEventListener('mouseleave', ()=> el.style.transform = '');
  });

  // floating images gentle movement
  const cat = document.querySelector('.floating-cat');
  const dog = document.querySelector('.floating-dog');
  let t = 0;
  function bob(){
    t += 0.02;
    const y1 = Math.sin(t) * 6;
    const x1 = Math.cos(t/1.5) * 6;
    if(cat) cat.style.transform = `translate(${x1}px, ${y1}px) rotate(-6deg)`;
    if(dog) dog.style.transform = `translate(${-x1}px, ${-y1}px) rotate(8deg)`;
    requestAnimationFrame(bob);
  }
  requestAnimationFrame(bob);

  const d = document.getElementById('careDropdown');
  d.addEventListener('click', function(e){ e.stopPropagation(); this.classList.toggle('open'); });
  document.addEventListener('click', function(){ d.classList.remove('open'); });
})();

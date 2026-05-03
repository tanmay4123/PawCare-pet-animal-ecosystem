/* ── CURSOR ── */
  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx+'px'; cursorDot.style.top = my+'px';
  });
  (function loop(){
    rx += (mx-rx)*.14; ry += (my-ry)*.14;
    cursorRing.style.left = rx+'px'; cursorRing.style.top = ry+'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('.listing-card,.fcard').forEach(c=>{
    c.addEventListener('mouseenter',()=>document.body.classList.add('on-card'));
    c.addEventListener('mouseleave',()=>document.body.classList.remove('on-card'));
  });

  /* ── SCROLL PROGRESS + NAV ── */
  const sb = document.getElementById('scrollBar');
  window.addEventListener('scroll',()=>{
    sb.style.width = (window.scrollY/(document.body.scrollHeight-innerHeight)*100)+'%';
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY>30);
  });

  /* ── TOAST ── */
  let toastTimer;
  function showToast(msg){
    clearTimeout(toastTimer);
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    toastTimer = setTimeout(()=>t.classList.remove('show'),3000);
  }

  /* ── INTERSECTION OBSERVER — entry animations ── */
  const allCards = document.querySelectorAll('.listing-card,.step-card,.why-card');
  const io = new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        setTimeout(()=>e.target.classList.add('visible'), i*110);
        io.unobserve(e.target);
      }
    });
  },{threshold:.14});
  allCards.forEach(c=>io.observe(c));

  /* ── 3D TILT on listing cards ── */
  document.querySelectorAll('.listing-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
      const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
      card.style.transform=`translateY(-12px) scale(1.022) perspective(860px) rotateX(${-dy*4}deg) rotateY(${dx*4}deg)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });

  /* ── TAB SWITCHER ── */
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      // show/hide panels
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      if(tab==='all'){
        document.getElementById('tab-all').classList.add('active');
      } else {
        // clone filtered cards into the right panel
        const panel = document.getElementById('tab-'+tab);
        panel.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'listing-grid';
        document.querySelectorAll('#tab-all .listing-card').forEach(card=>{
          if(card.dataset.kind===tab){
            const clone = card.cloneNode(true);
            clone.classList.remove('visible');
            // re-attach book/save handlers on clone
            const bBtn = clone.querySelector('.book-btn');
            if(bBtn) bBtn.addEventListener('click',handleBook);
            const sBtn = clone.querySelector('.save-btn');
            if(sBtn) sBtn.addEventListener('click',handleSave);
            grid.appendChild(clone);
          }
        });
        panel.appendChild(grid);
        panel.classList.add('active');
        // animate in
        setTimeout(()=>{
          panel.querySelectorAll('.listing-card').forEach((c,i)=>
            setTimeout(()=>c.classList.add('visible'),i*110)
          );
        },50);
      }
      showToast(tab==='all' ? '🐾 Showing all listings' : tab==='sitter' ? '🏠 Showing home sitters' : '☀️ Showing daycare homes');
    });
  });

  /* ── SAVE / WISHLIST ── */
  const saved = new Set();
  function handleSave(e){
    e.stopPropagation();
    const btn = e.currentTarget;
    const id  = btn.dataset.id;
    if(saved.has(id)){
      saved.delete(id);
      btn.textContent='🤍';
      btn.classList.remove('saved');
      showToast('Removed from saved');
    } else {
      saved.add(id);
      btn.textContent='❤️';
      btn.classList.add('saved');
      showToast('❤️ Saved to your list!');
    }
  }
  document.querySelectorAll('.save-btn').forEach(b=>b.addEventListener('click',handleSave));

  /* ── BOOKING MODAL ── */
  const overlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');

  function handleBook(e){
    e.stopPropagation();
    const btn  = e.currentTarget;
    const name = btn.dataset.name;
    const type = btn.dataset.type;
    document.getElementById('modalTitle').textContent = 'Book — '+name;
    document.getElementById('modalSub').textContent   = type+' · Fill in details and we\'ll confirm within 2 hours.';
    document.getElementById('modalSuccess').style.display = 'none';
    document.getElementById('bookingForm').style.display  = '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  document.querySelectorAll('.book-btn').forEach(b=>b.addEventListener('click',handleBook));
  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closeModal(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* booking form submit */
  document.getElementById('bookingForm').addEventListener('submit',function(e){
    e.preventDefault();
    const name  = document.getElementById('bName').value.trim();
    const phone = document.getElementById('bPhone').value.trim();
    const pet   = document.getElementById('bPet').value.trim();
    const start = document.getElementById('bStart').value;
    const end   = document.getElementById('bEnd').value;
    if(!name||!phone||!pet||!start||!end){
      showToast('⚠️ Please fill all required fields'); return;
    }
    const btn = this.querySelector('.modal-submit');
    btn.textContent = '⏳ Sending…'; btn.disabled = true;
    setTimeout(()=>{
      this.style.display='none';
      document.getElementById('modalSuccess').style.display='block';
      showToast('🎉 Booking request sent!');
      setTimeout(closeModal, 4200);
    },1600);
  });

  /* ── SEARCH BUTTON ── */
  document.getElementById('searchBtn').addEventListener('click',()=>{
    const city = document.getElementById('srchCity').value.trim();
    const type = document.getElementById('srchType').value;
    showToast(city ? `🔍 Searching in ${city}…` : '🔍 Searching all cities…');
    // animate the grid cards
    document.querySelectorAll('#tab-all .listing-card').forEach(c=>{
      c.style.transition='opacity .3s, transform .3s';
      c.style.opacity='0'; c.style.transform='scale(.95)';
    });
    setTimeout(()=>{
      document.querySelectorAll('#tab-all .listing-card').forEach((c,i)=>{
        const match = !type || c.dataset.kind===type;
        setTimeout(()=>{
          c.style.opacity = match?'1':'0.25';
          c.style.transform = match?'':'scale(.95)';
        },i*80);
      });
    },380);
  });

  /* ── FAQ ACCORDION ── */
  document.querySelectorAll('.faq-q').forEach(q=>{
    q.addEventListener('click',()=>{
      const item = q.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });

  /* ── SET DEFAULT DATE RANGE (today + 7 days) ── */
  const today = new Date();
  const next7 = new Date(today); next7.setDate(next7.getDate()+7);
  const fmt = d => d.toISOString().split('T')[0];
  document.getElementById('srchFrom').value = fmt(today);
  document.getElementById('srchTo').value   = fmt(next7);
  document.getElementById('bStart').value   = fmt(today);
  document.getElementById('bEnd').value     = fmt(next7);
/* script.js
   Final PawCare map (Lavender Soft) — Layout A (map 80% / info 20%)
   - Map visibility intentionally robust (explicit heights + DOMContentLoaded + invalidateSize)
   - Purple paw SVG icon (data URL)
   - 20 clinics (approx coords provided earlier)
*/

document.addEventListener('DOMContentLoaded', () => {

  /* Paw SVG marker (purple gradient) */
  const pawSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#B493FF"/>
        <stop offset="1" stop-color="#7C45FF"/>
      </linearGradient></defs>
      <rect rx="12" width="56" height="56" fill="url(#g)"/>
      <g transform="translate(9,8)" fill="#fff">
        <ellipse cx="5" cy="6" rx="3.8" ry="4.6"/>
        <ellipse cx="13" cy="4.6" rx="3.6" ry="4"/>
        <ellipse cx="21" cy="6" rx="3.8" ry="4.6"/>
        <ellipse cx="13" cy="16.5" rx="6.6" ry="5.6"/>
      </g>
    </svg>`);
  const pawIcon = L.icon({
    iconUrl: 'data:image/svg+xml;utf8,' + pawSvg,
    iconSize: [42,42],
    iconAnchor: [21,42],
    popupAnchor: [0,-36]
  });

  // Create map and set view (Pune)
  const map = L.map('map', { zoomControl: true }).setView([18.5204, 73.8567], 12);

  // OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Clinics data (20) - neighborhood coordinates used (your list)
  const clinics = [
    {"name":"Companion Vet Care Clinic","address":"Shop No 1, S.No 34, Building Akshay Paradise, Hingne Khurd-411051","phone":"7487076484","rating":"5","speciality":"Multi-speciality: vaccinations, consultations, surgeries, diagnostics","maps_link":"https://maps.app.goo.gl/hN7vEdNzMQRiDuzg8","lat":18.47531,"lng":73.83056},
    {"name":"Animal Care","address":"Jacinta Villa, Next to Bandhangad Society, Opp. Sandalwood Society, Aundh-411007","phone":"9035290878","rating":"4.5","speciality":"General veterinary & preventive medicine","maps_link":"https://maps.app.goo.gl/JmuzcVrjPBLHWGB1A","lat":18.57210,"lng":73.80250},
    {"name":"Dr. Gorhes Pet Cover Advanced Veterinary Clinic","address":"Pet Cover, Near Karve Statue Next to Sutar Bus Stand, Karve Road, Kothrud-411029","phone":"9035058221","rating":"4.4","speciality":"Advanced care: surgeries, emergency, grooming","maps_link":"https://maps.app.goo.gl/6gqApp6XXXxTCzLv8","lat":18.50719,"lng":73.81139},
    {"name":"Pet World Clinic","address":"Office- 4 A, Prince Garden, Near Residency Club, Magarpatta City, Bund Garden Road-411001","phone":"9035085324","rating":"4.3","speciality":"Multi-speciality hospital: routine & emergency care","maps_link":"https://maps.app.goo.gl/8AiGDrhZHYyd8DDi7","lat":18.51500,"lng":73.87908},
    {"name":"Pet Max Clinic","address":"42/2, Abhijeet Apartment, Near Kirti Hardware Paud Phata, Karve Road, Kothrud-411038","phone":"","rating":"4.7","speciality":"Multi-speciality: consultations, surgery, diagnostics","maps_link":"https://maps.app.goo.gl/kMMmWB3NqWdNRpMr8","lat":18.50489,"lng":73.82489},
    {"name":"Woof & Meow","address":"Shop No. 19/1C, Royal Arcade, Near Shankar Maharaj Math, Dhankawadi-411043","phone":"9980128394","rating":"4.8","speciality":"Pet clinic + grooming: basic surgery & vaccination","maps_link":"https://maps.app.goo.gl/buAeKo8CiznZ9xXS8","lat":18.47178,"lng":73.85700},
    {"name":"Vet Pet Clinic","address":"P 403, Wonder City, Near Katraj Dairy, Katraj Bypass Rd, Katraj-411046","phone":"9035196502","rating":"4.5","speciality":"General veterinary: wellness checks & vaccination","maps_link":"https://maps.app.goo.gl/gqtKH4vHfoK8WbAn7","lat":18.44917,"lng":73.84897},
    {"name":"Starpugs Pet Care & Veterinary Services","address":"Sawant Park, Near Vodafone Idea Care, Chatanya Nagar, Dhankwadi, Pune Satara Road, Katraj-411046","phone":"8197589213","rating":"4.6","speciality":"Multi-service clinic: small breed & general surgeries","maps_link":"https://maps.app.goo.gl/yyLXPPgQ8Fd9BBLR7","lat":18.46167,"lng":73.85794},
    {"name":"Pet Doc Vet Clinic","address":"House No 4, Near Cellars Wine Shop, Pancard Club Road, Baner-411045","phone":"9035177302","rating":"4.7","speciality":"Multi-speciality: orthopaedic, soft-tissue, diagnostics","maps_link":"https://maps.app.goo.gl/hhjPgfwQfbbE5Zp88","lat":18.55833,"lng":73.77899},
    {"name":"Pets Lifeline","address":"Shop No 22, Kalamkar Corner, Next to Jupiter Hospital, Near Jogeshwari Misal, Baner-411045","phone":"8105251789","rating":"3.9","speciality":"Clinic / rescue: vaccinations, adoption support","maps_link":"https://maps.app.goo.gl/m5SsaWFJxni3mXa47","lat":18.56508,"lng":73.78842},
    {"name":"Pet Med Veterinary Clinic","address":"Shop 10, Runwal Diamond Complex, Near Maiss Hotel, Opposite Palace Orchid Society, Undri NIBM Road, Undri-411060","phone":"9035146657","rating":"4.5","speciality":"General & specialty: pathology, surgery, routine care","maps_link":"https://maps.app.goo.gl/vymeytGNPfvBq7zU9","lat":18.46375,"lng":73.90453},
    {"name":"Dr. Dahekar Pet Clinic & Pet Shop","address":"Shop No 26A, Vardhman Township, Near Railway Crossing, Sasane Nagar Road, Sasane Nagar-Hadapsar-411028","phone":"8511401722","rating":"3.6","speciality":"Clinic + shop: orthopaedic & soft-tissue surgery","maps_link":"https://maps.app.goo.gl/99c2dwvJQzjEcDCC7","lat":18.48947,"lng":73.93214},
    {"name":"Pet Ozone Pet Clinic","address":"Shop No 5, Rose Icon Commercial Complex, Near Pizza Hut, Kunal Icon Main Road, Pimple Saudagar-411027","phone":"9035193886","rating":"4.7","speciality":"Multi-location: surgery, X-ray, pathology, grooming","maps_link":"https://maps.app.goo.gl/UDNbFp6irw8NLHPv6","lat":18.59339,"lng":73.79922},
    {"name":"Sniffi - Home Veterinary Care","address":"Office No. 320, 10, Biz Park, Near By Semboys College, Airport Road, Viman Nagar-411014","phone":"8487881202","rating":"4.9","speciality":"Home veterinary: doorstep consultation & vaccination","maps_link":"https://maps.app.goo.gl/AxNbLsoZW5nRNh4R6","lat":18.57556,"lng":73.90981},
    {"name":"Delight Pet Shop & Pet Clinic","address":"Shop No. 27, Aishwarya Apartment, Gawde Nagar, Opposite Gawde Petrol Pump, Link Road, Chinchwad-411033","phone":"9035249159","rating":"4.5","speciality":"Pet shop + clinic: grooming & consultation","maps_link":"https://maps.app.goo.gl/522mysauVcx65LZG8","lat":18.63025,"lng":73.79175},
    {"name":"Vetpet Clinic","address":"Ground Floor, Vetpet Clinic, Opp PMT Bus Stop, Near Harpale Clinic, Saswad Road, Bhekrai Nagar-Fursungi-412308","phone":"8296111823","rating":"4.4","speciality":"General veterinary: consultation & vaccination","maps_link":"https://maps.app.goo.gl/M2w12L5HMxYtYH9n8","lat":18.48542,"lng":73.95342},
    {"name":"Goodwill Pet Clinic","address":"Ground Floor, Manjal Niwas, Near Maharashtra Biryani, BRT Road, Chatrapati Shivaji Maharaj Chauk, Kalewadi-411017","phone":"8460524494","rating":"4.9","speciality":"General clinic: in-house pharmacy, routine surgery","maps_link":"https://maps.app.goo.gl/nnQCxRZdw8c6e5jRA","lat":18.48542,"lng":73.95342},
    {"name":"My Pet Care Veterinary Center","address":"Sr No 201/24B, Near Toyota Showroom Next to Wisdom, DP Road, Hadapsar-411028","phone":"7490904443","rating":"4.4","speciality":"Multi-speciality: surgery, diagnostics, pharmacy","maps_link":"https://maps.app.goo.gl/37JKg3CnJ8Myva4u7","lat":18.51050,"lng":73.93906},
    {"name":"Fur N Feather","address":"Devghandhar Apartment Sector No 18 Sambhaji Nagar, Shivaji Park, Sambhaji Nagar Road, Chinchwad East-411019","phone":"9035088131","rating":"4.3","speciality":"Vet clinic + grooming: X-ray, blood tests, surgery","maps_link":"https://maps.app.goo.gl/i6bSk5PjoGyn226R8","lat":18.66611,"lng":73.80086}
  ];

  // Update totals
  document.getElementById('total-count').textContent = clinics.length;

  // Add markers and popups
  let placed = 0;
  clinics.forEach(c => {
    const marker = L.marker([c.lat, c.lng], { icon: pawIcon, riseOnHover: true }).addTo(map);

    function stars(r){
      const rnum = parseFloat(r) || 0;
      const full = Math.floor(rnum);
      const half = (rnum - full) >= 0.5 ? 1 : 0;
      let s = '⭐'.repeat(full);
      if (half) s += '✶';
      return s;
    }

    const phoneHTML = c.phone ? `<div class="doctor-line">📞 <a href="tel:${c.phone}">${c.phone}</a></div>` : '';
    const ratingHTML = c.rating ? `<div class="doctor-line">Rating: ${stars(c.rating)} (${c.rating})</div>` : '';
    const specHTML = c.speciality ? `<div class="doctor-line">${c.speciality}</div>` : '';
    const mapsHref = c.maps_link ? c.maps_link : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.lat + ',' + c.lng)}`;

    const popupHtml = `
      <div class="popup-card">
        <div class="doctor-title">${c.name}</div>
        <div class="doctor-line">${c.address}</div>
        ${specHTML}
        ${phoneHTML}
        ${ratingHTML}
        <div style="margin-top:8px;"><a class="link-btn" target="_blank" rel="noopener" href="${mapsHref}">Get Directions</a></div>
      </div>
    `;

    marker.bindPopup(popupHtml, { minWidth: 260, maxWidth: 360 });

    marker.on('add', () => {
      const el = marker._icon;
      if (!el) return;
      el.style.transformOrigin = 'center bottom';
      el.animate([
        { transform: 'translateY(-20px) scale(.95)', opacity: 0 },
        { transform: 'translateY(0) scale(1)', opacity: 1 }
      ], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });

    placed++;
    document.getElementById('located-count').textContent = placed;
  });

  // Pune bounds
  const southWest = L.latLng(18.32, 73.70);
  const northEast = L.latLng(18.75, 74.05);
  const bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);

  // keep map inside bounds on moveend
  map.on('moveend', () => {
    if (!bounds.contains(map.getCenter())) {
      map.panInsideBounds(bounds, { animate: true });
    }
  });

  // ensure tiles render and open first popup
  setTimeout(() => {
    map.invalidateSize();
    const firstMarker = Object.values(map._layers).find(l => l instanceof L.Marker);
    if (firstMarker) firstMarker.openPopup();
  }, 600);

  // chatbot placeholder
  document.getElementById('chatbot').addEventListener('click', () => {
    alert('PawCare Chat — placeholder. Integrate your chatbot endpoint or open chat page.');
  });

});

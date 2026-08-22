/* ==========================================================
   D'Royals Travels & Tours — Shared Behaviour
   NOTE: Flight/hotel data below is SAMPLE data for a working
   demo flow. Swap DR.searchFlights()/searchHotels() for real
   API calls (Amadeus/Duffel/Travelport etc.) when ready — the
   UI and lead-capture flow around it stay the same.
   ========================================================== */

const DR = (function(){

  /* ---------------- SUPABASE CONFIG ----------------
     1. Create a project at supabase.com
     2. Run supabase-setup.sql in the SQL Editor
     3. Paste your Project URL + anon public key below
        (Settings → API in the Supabase dashboard)
     Leave as-is and the site falls back to a local-only
     demo mode (forms "succeed" but nothing is saved).
  --------------------------------------------------- */
  const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";       // e.g. https://xyzcompany.supabase.co
  const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";     // the public "anon" key, safe for frontend use

  let supabaseClient = null;
  const supabaseConfigured = SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
  if(supabaseConfigured && window.supabase){
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  /* ---------------- DATA ---------------- */
  const CITIES = [
    {code:"LOS", city:"Lagos", country:"Nigeria"},
    {code:"ABV", city:"Abuja", country:"Nigeria"},
    {code:"PHC", city:"Port Harcourt", country:"Nigeria"},
    {code:"KAN", city:"Kano", country:"Nigeria"},
    {code:"ENU", city:"Enugu", country:"Nigeria"},
    {code:"LHR", city:"London", country:"United Kingdom"},
    {code:"DXB", city:"Dubai", country:"United Arab Emirates"},
    {code:"CDG", city:"Paris", country:"France"},
    {code:"JFK", city:"New York", country:"United States"},
    {code:"ATL", city:"Atlanta", country:"United States"},
    {code:"JNB", city:"Johannesburg", country:"South Africa"},
    {code:"NBO", city:"Nairobi", country:"Kenya"},
    {code:"ACC", city:"Accra", country:"Ghana"},
    {code:"IST", city:"Istanbul", country:"Türkiye"},
    {code:"DOH", city:"Doha", country:"Qatar"},
    {code:"ZNZ", city:"Zanzibar", country:"Tanzania"},
    {code:"JTR", city:"Santorini", country:"Greece"},
    {code:"DPS", city:"Bali (Denpasar)", country:"Indonesia"}
  ];

  const AIRLINES = ["Air Peace","Arik Air","Qatar Airways","Emirates","British Airways","Turkish Airlines","Ethiopian Airlines","Egyptair","Lufthansa","Ibom Air"];

  const DESTINATIONS = [
    {city:"Dubai", country:"United Arab Emirates", hotels:312, img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=75"},
    {city:"Paris", country:"France", hotels:288, img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=75"},
    {city:"Santorini", country:"Greece", hotels:96, img:"https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=75"},
    {city:"Bali", country:"Indonesia", hotels:210, img:"https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=75"},
    {city:"London", country:"United Kingdom", hotels:401, img:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=75"},
    {city:"Zanzibar", country:"Tanzania", hotels:118, img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=75"},
    {city:"Cape Town", country:"South Africa", hotels:174, img:"https://images.unsplash.com/photo-1580060839429-ec4f6d1d1653?auto=format&fit=crop&w=900&q=75"},
    {city:"Istanbul", country:"Türkiye", hotels:265, img:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=75"},
    {city:"New York", country:"United States", hotels:340, img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=75"}
  ];

  const PACKAGES = [
    {name:"Santorini Honeymoon Escape", place:"Greek Islands", days:"7 Nights", desc:"Caldera-view suite, private sunset dinner in Oia, catamaran cruise and airport transfers.", price:"₦2,180,000", per:"per couple", img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=75"},
    {name:"Dubai City & Desert", place:"United Arab Emirates", days:"5 Nights", desc:"4-star city hotel, Burj Khalifa access, desert safari with BBQ dinner and transfers included.", price:"₦1,340,000", per:"per person", img:"https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=800&q=75"},
    {name:"Bali Wellness Retreat", place:"Indonesia", days:"6 Nights", desc:"Ubud jungle villa, daily yoga, rice terrace tour and a private waterfall day trip.", price:"₦1,750,000", per:"per person", img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=75"},
    {name:"London Family Getaway", place:"United Kingdom", days:"5 Nights", desc:"Central hotel near the Tube, London Eye & Harry Potter Studio tickets, airport transfers.", price:"₦2,050,000", per:"per family of 4", img:"https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=800&q=75"},
    {name:"Zanzibar Beach Break", place:"Tanzania", days:"5 Nights", desc:"Beachfront resort, Stone Town heritage tour and a sunset dhow cruise.", price:"₦1,120,000", per:"per person", img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=75"},
    {name:"Istanbul Heritage Trail", place:"Türkiye", days:"6 Nights", desc:"Old-city boutique hotel, Bosphorus cruise, Cappadocia balloon add-on available.", price:"₦1,480,000", per:"per person", img:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=75"}
  ];

  const VISA_COUNTRIES = ["United Kingdom","Schengen (France/Germany/etc.)","United States","Canada","United Arab Emirates","South Africa"];

  /* ---------------- UTIL ---------------- */
  function fmtNaira(n){ return "₦" + n.toLocaleString("en-NG"); }
  function pad(n){ return n < 10 ? "0"+n : ""+n; }
  function seededRand(seed){
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /* ---------------- NAV / MOBILE MENU ---------------- */
  function initNav(){
    const burger = document.querySelector(".burger");
    const mobileNav = document.querySelector(".mobile-nav");
    if(burger && mobileNav){
      burger.addEventListener("click", ()=>{
        mobileNav.classList.toggle("open");
      });
      mobileNav.querySelectorAll("a").forEach(a=>{
        a.addEventListener("click", ()=> mobileNav.classList.remove("open"));
      });
    }
    const header = document.querySelector("header");
    if(header){
      window.addEventListener("scroll", ()=>{
        header.style.background = window.scrollY > 40 ? "rgba(6,10,22,0.94)" : "rgba(6,10,22,0.75)";
      });
    }
    // mark active link
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-nav a").forEach(a=>{
      if(a.getAttribute("href") === path) a.classList.add("active");
    });
  }

  /* ---------------- REVEAL ---------------- */
  function initReveal(){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
  }

  /* ---------------- FAQ ---------------- */
  function initFaq(){
    document.querySelectorAll(".faq-item").forEach(item=>{
      const q = item.querySelector(".faq-q");
      const a = item.querySelector(".faq-a");
      if(!q || !a) return;
      if(item.classList.contains("open")) a.style.maxHeight = a.scrollHeight + "px";
      q.addEventListener("click", ()=>{
        const isOpen = item.classList.contains("open");
        item.parentElement.querySelectorAll(".faq-item").forEach(other=>{
          other.classList.remove("open");
          other.querySelector(".faq-a").style.maxHeight = null;
        });
        if(!isOpen){
          item.classList.add("open");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------------- CITY AUTOCOMPLETE ---------------- */
  function initAutocomplete(inputEl, listEl){
    if(!inputEl || !listEl) return;
    let hiIndex = -1, matches = [];

    function render(){
      const val = inputEl.value.trim().toLowerCase();
      matches = !val ? CITIES.slice(0,6) : CITIES.filter(c =>
        c.city.toLowerCase().includes(val) || c.code.toLowerCase().includes(val) || c.country.toLowerCase().includes(val)
      ).slice(0,7);
      listEl.innerHTML = matches.map((c,i)=>
        `<button type="button" data-code="${c.code}" data-city="${c.city}" class="${i===hiIndex?'hi':''}"><b>${c.city}</b> (${c.code}) — ${c.country}</button>`
      ).join("");
      listEl.classList.toggle("show", matches.length > 0);
    }
    inputEl.addEventListener("focus", render);
    inputEl.addEventListener("input", ()=>{ hiIndex=-1; render(); });
    inputEl.addEventListener("keydown", (e)=>{
      if(e.key === "ArrowDown"){ e.preventDefault(); hiIndex = Math.min(hiIndex+1, matches.length-1); render(); }
      if(e.key === "ArrowUp"){ e.preventDefault(); hiIndex = Math.max(hiIndex-1, 0); render(); }
      if(e.key === "Enter" && hiIndex >= 0){ e.preventDefault(); selectMatch(matches[hiIndex]); }
      if(e.key === "Escape"){ listEl.classList.remove("show"); }
    });
    listEl.addEventListener("mousedown", (e)=>{
      const btn = e.target.closest("button");
      if(!btn) return;
      const c = matches.find(m => m.code === btn.dataset.code);
      selectMatch(c);
    });
    document.addEventListener("click", (e)=>{
      if(!inputEl.contains(e.target) && !listEl.contains(e.target)) listEl.classList.remove("show");
    });
    function selectMatch(c){
      inputEl.value = `${c.city} (${c.code})`;
      inputEl.dataset.code = c.code;
      listEl.classList.remove("show");
    }
  }

  /* ---------------- MOCK FLIGHT SEARCH ---------------- */
  function searchFlights({from, to, cabin}){
    // Deterministic "sample" fares so the same route always looks consistent.
    const seedBase = (from||"LOS").charCodeAt(0) + (to||"DXB").charCodeAt(0);
    const results = [];
    const count = 5;
    for(let i=0;i<count;i++){
      const seed = seedBase + i * 7.31;
      const airline = AIRLINES[Math.floor(seededRand(seed)*AIRLINES.length)];
      const basePrice = 180000 + Math.floor(seededRand(seed+1)*1600000);
      const cabinMult = cabin === "Business" ? 3.4 : cabin === "First Class" ? 5.2 : cabin === "Premium Economy" ? 1.6 : 1;
      const price = Math.round((basePrice * cabinMult) / 1000) * 1000;
      const depH = 5 + Math.floor(seededRand(seed+2)*17);
      const depM = Math.floor(seededRand(seed+3)*4)*15;
      const durH = 1 + Math.floor(seededRand(seed+4)*11);
      const durM = Math.floor(seededRand(seed+5)*4)*15;
      let arrH = (depH + durH + Math.floor((depM+durM)/60)) % 24;
      let arrM = (depM + durM) % 60;
      const stops = seededRand(seed+6) > 0.6 ? 1 : 0;
      results.push({
        airline, price, cabin: cabin || "Economy",
        dep: `${pad(depH)}:${pad(depM)}`, arr: `${pad(arrH)}:${pad(arrM)}`,
        duration: `${durH}h ${durM}m`, stops, from, to
      });
    }
    return results.sort((a,b)=>a.price-b.price);
  }

  function renderFlightResults(container, results, fromLabel, toLabel){
    if(!container) return;
    if(!results.length){
      container.innerHTML = `<p style="color:var(--muted); font-size:14px;">No sample fares for this route yet — send an enquiry below and an agent will source it for you.</p>`;
      return;
    }
    container.innerHTML = results.map(r => `
      <div class="result-card reveal in">
        <div class="result-main">
          <div class="result-airline">
            <div class="airline-dot">${r.airline.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
            <span>${r.airline}</span>
          </div>
          <div class="result-route">
            <div><span class="time">${r.dep}</span><span class="code" style="display:block;">${fromLabel}</span></div>
            <div class="line"></div>
            <div><span class="time">${r.arr}</span><span class="code" style="display:block;">${toLabel}</span></div>
          </div>
          <div class="result-meta">${r.duration} · ${r.stops === 0 ? "Nonstop" : r.stops + " stop"} · ${r.cabin}</div>
        </div>
        <div class="result-price">
          <span class="label">From</span>
          <span class="amount">${fmtNaira(r.price)}</span>
          <button class="btn btn-gold btn-sm dr-select-flight" data-airline="${r.airline}" data-price="${r.price}" data-route="${fromLabel} → ${toLabel}">Select</button>
        </div>
      </div>
    `).join("");
  }

  /* ---------------- MOCK HOTEL SEARCH ---------------- */
  const HOTEL_NAMES = ["Grand Regency","Palm Court Suites","The Continental","Azure Bay Resort","Meridian Hotel","Oakwood Residences","Marina View Hotel","The Kingsley"];
  function searchHotels({city}){
    const seedBase = (city||"Dubai").length * 13;
    const results = [];
    for(let i=0;i<5;i++){
      const seed = seedBase + i*5.7;
      const name = HOTEL_NAMES[Math.floor(seededRand(seed)*HOTEL_NAMES.length)];
      const stars = 3 + Math.floor(seededRand(seed+1)*3);
      const price = Math.round((45000 + seededRand(seed+2)*260000)/1000)*1000;
      const dest = DESTINATIONS.find(d => d.city.toLowerCase().includes((city||"").toLowerCase())) || DESTINATIONS[0];
      results.push({name: `${name} ${city||""}`, stars, price, img: dest.img, city});
    }
    return results.sort((a,b)=>a.price-b.price);
  }
  function renderHotelResults(container, results){
    if(!container) return;
    if(!results.length){ container.innerHTML = `<p style="color:var(--muted); font-size:14px;">No sample stays for this city yet — send an enquiry and an agent will find options.</p>`; return; }
    container.innerHTML = results.map(h => `
      <div class="hotel-card reveal in">
        <img src="${h.img}" alt="${h.name}">
        <div class="hotel-info">
          <h4>${h.name}</h4>
          <div class="stars">${"★".repeat(h.stars)}${"☆".repeat(5-h.stars)}</div>
          <p>Free cancellation on select rates · Breakfast available · ${h.city}</p>
        </div>
        <div class="result-price">
          <span class="label">Per night</span>
          <span class="amount">${fmtNaira(h.price)}</span>
          <button class="btn btn-gold btn-sm dr-select-hotel" data-hotel="${h.name}" data-price="${h.price}">Select</button>
        </div>
      </div>
    `).join("");
  }

  /* ---------------- LEAD / ENQUIRY FORM ---------------- */
  // Reads every named field in the form into { full_name, phone, email, ...rest }
  // "rest" becomes the `details` jsonb column. Add name="" to any input you
  // want captured — anything without a name is ignored.
  function collectFormData(formEl){
    const data = new FormData(formEl);
    const known = { full_name:"", phone:"", email:"" };
    const details = {};
    for(const [key, value] of data.entries()){
      if(key in known) known[key] = value;
      else details[key] = value;
    }
    return { ...known, details };
  }

  function initLeadForm(formEl){
    if(!formEl) return;
    const leadType = formEl.dataset.leadType || "general";
    formEl.addEventListener("submit", async (e)=>{
      e.preventDefault();
      if(!formEl.checkValidity()){ formEl.reportValidity(); return; }
      const btn = formEl.querySelector("button[type=submit]");
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";

      const payload = collectFormData(formEl);
      let ok = true, errorMsg = "";

      if(supabaseClient){
        const { error } = await supabaseClient.from("leads").insert({
          lead_type: leadType,
          full_name: payload.full_name || null,
          phone: payload.phone || null,
          email: payload.email || null,
          details: payload.details
        });
        if(error){ ok = false; errorMsg = error.message; }
      } else {
        // Demo mode — no Supabase configured yet, simulate the network delay.
        await new Promise(r => setTimeout(r, 700));
      }

      btn.textContent = original;
      btn.disabled = false;

      const success = formEl.parentElement.querySelector(".form-success") || document.querySelector(".form-success");
      if(ok){
        formEl.reset();
        if(success){
          success.classList.add("show");
          success.scrollIntoView({behavior:"smooth", block:"center"});
        }
      } else {
        alert("Something went wrong sending your enquiry: " + errorMsg + "\nPlease try again or reach us on WhatsApp.");
      }
    });
  }

  /* ---------------- INIT ALL ---------------- */
  function init(){
    initNav();
    initReveal();
    initFaq();
  }

  return {
    CITIES, AIRLINES, DESTINATIONS, PACKAGES, VISA_COUNTRIES,
    fmtNaira, init, initAutocomplete, initLeadForm,
    searchFlights, renderFlightResults, searchHotels, renderHotelResults
  };
})();

document.addEventListener("DOMContentLoaded", DR.init);

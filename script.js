/* ==============================================================
   DATA LAYER
   NOTE FOR PRODUCTION: this file uses localStorage as a stand-in
   database so the site works instantly with zero setup. To wire
   up the real stack described in the brief:
     - Replace `loadProducts()/saveProducts()` with Firestore reads
       (onSnapshot on a `products` collection) and writes
       (addDoc/updateDoc/deleteDoc).
     - Replace the image URL field in the admin form with an
       upload to Firebase Storage, then store the returned
       download URL on the product document.
     - Replace the demo admin login with Firebase Authentication
       (signInWithEmailAndPassword) and gate #admin behind
       onAuthStateChanged.
   The rest of the UI (rendering, filtering, search, modals) will
   work unchanged since it already reads from a single `products`
   array in memory.
================================================================== */

const CATEGORIES = [
  { id:'fruit',       name:'Fruit Trees',       icon:'🍎', img:'https://images.unsplash.com/photo-1550828484-4d6b8ba4b3c8?auto=format&fit=crop&w=400&q=80' },
  { id:'flowering',   name:'Flowering Trees',   icon:'🌸', img:'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=400&q=80' },
  { id:'indoor',      name:'Indoor Plants',     icon:'🪴', img:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80' },
  { id:'outdoor',     name:'Outdoor Plants',    icon:'🌳', img:'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80' },
  { id:'medicinal',   name:'Medicinal Plants',  icon:'🌿', img:'https://images.unsplash.com/photo-1462530260150-162092dbf011?auto=format&fit=crop&w=400&q=80' },
  { id:'decorative',  name:'Decorative Plants', icon:'🎋', img:'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=400&q=80' },
];

const DEFAULT_PRODUCTS = [
  { id:crypto.randomUUID(), name:'Alphonso Mango Sapling', price:499, category:'fruit', stock:true, image:'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=700&q=80', description:'Premium grafted mango sapling, fruits in 3-4 years, sweet Alphonso variety.' },
  { id:crypto.randomUUID(), name:'Guava Plant', price:299, category:'fruit', stock:true, image:'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=700&q=80', description:'Hardy, fast-growing guava plant that thrives in most soil types.' },
  { id:crypto.randomUUID(), name:'Gulmohar Tree', price:399, category:'flowering', stock:true, image:'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=700&q=80', description:'Flame-of-the-forest tree with brilliant orange-red summer blooms.' },
  { id:crypto.randomUUID(), name:'Hibiscus Plant', price:199, category:'flowering', stock:false, image:'https://images.unsplash.com/photo-1597055181300-e3246d4d4693?auto=format&fit=crop&w=700&q=80', description:'Classic garden favourite with large, vivid red flowers.' },
  { id:crypto.randomUUID(), name:'Areca Palm', price:649, category:'indoor', stock:true, image:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80', description:'Air-purifying indoor palm, low maintenance, elegant fronds.' },
  { id:crypto.randomUUID(), name:'Snake Plant', price:249, category:'indoor', stock:true, image:'https://images.unsplash.com/photo-1493957988430-a5f2e15f39a3?auto=format&fit=crop&w=700&q=80', description:'Nearly indestructible, thrives in low light, purifies indoor air.' },
  { id:crypto.randomUUID(), name:'Neem Tree', price:349, category:'medicinal', stock:true, image:'https://images.unsplash.com/photo-1462530260150-162092dbf011?auto=format&fit=crop&w=700&q=80', description:'Traditional medicinal tree, natural pest repellent, shade-giving.' },
  { id:crypto.randomUUID(), name:'Aloe Vera', price:149, category:'medicinal', stock:true, image:'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&w=700&q=80', description:'Soothing gel-filled leaves, easy care, great for skin & hair.' },
  { id:crypto.randomUUID(), name:'Bamboo Cluster', price:549, category:'decorative', stock:true, image:'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=700&q=80', description:'Fast-growing ornamental bamboo, adds height and texture to any garden.' },
  { id:crypto.randomUUID(), name:'Bonsai Ficus', price:1299, category:'decorative', stock:true, image:'https://images.unsplash.com/photo-1502394202744-021cfbb17454?auto=format&fit=crop&w=700&q=80', description:'Hand-trained bonsai, a striking centrepiece for home or office.' },
  { id:crypto.randomUUID(), name:'Banyan Tree Sapling', price:699, category:'outdoor', stock:true, image:'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=700&q=80', description:'Majestic shade tree for large gardens and open plots.' },
  { id:crypto.randomUUID(), name:'Money Plant (Outdoor)', price:179, category:'outdoor', stock:false, image:'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b0f?auto=format&fit=crop&w=700&q=80', description:'Vigorous climbing vine, thought to bring good fortune.' },
];

const TESTIMONIALS = [
  { name:'Ritu Sharma', location:'Kolkata', rating:5, text:'Ordered a mango sapling and two flowering plants — every single one arrived healthy and well packed. Genuinely the best nursery I have used.' },
  { name:'Arjun Mehta', location:'Bengaluru', rating:5, text:'The team helped me pick indoor plants suited to low light. Two months on, everything is thriving. Great advice, fair prices.' },
  { name:'Sneha Iyer', location:'Pune', rating:4, text:'Lovely variety of medicinal plants. Delivery took a day longer than expected but the plants themselves were in excellent condition.' },
  { name:'Vikram Nair', location:'Chennai', rating:5, text:'My go-to nursery for every home project now. The bonsai ficus I bought is stunning and came with clear care instructions.' },
  { name:'Priya Das', location:'Hyderabad', rating:5, text:'Affordable, healthy, and beautifully packaged. They even followed up after delivery to check on the plants. Highly recommend.' },
  { name:'Karan Bose', location:'Delhi', rating:4, text:'Great range of fruit trees for my terrace garden. Replacement process for one damaged plant was quick and hassle-free.' },
];

const FAQS = [
  { q:'Do you deliver plants outside my city?', a:'Yes — we deliver across most regions with careful, root-safe packaging. Delivery timelines vary by location and are shown at checkout or shared via WhatsApp when you enquire.' },
  { q:'How do I care for a newly delivered plant?', a:'Keep the plant in indirect sunlight for the first 2-3 days to let it acclimatise, water lightly, and avoid repotting immediately. Every order includes a short care card specific to that plant.' },
  { q:'What if my plant arrives damaged?', a:'We offer a replacement or refund for any plant that arrives damaged or unhealthy — just share a photo within 48 hours of delivery and our team will sort it out quickly.' },
  { q:'How can I check if a plant is currently in stock?', a:'Every product card in our collection shows a live "In Stock" or "Out of Stock" tag. You can also message us directly on WhatsApp to confirm availability before ordering.' },
  { q:'Do you offer bulk or landscaping orders?', a:'Absolutely — for housing societies, offices, or landscaping projects, reach out via the contact form or phone and our team will put together a custom quote.' },
];

const STORAGE_KEY = 'ftn_products_v1';
function loadProducts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  saveProducts(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}
function saveProducts(list){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }catch(e){
    console.warn('Failed to save products to localStorage:', e);
    showToast('Storage full — some changes may not persist.');
  }
}
let PRODUCTS = loadProducts();

function catName(id){ const c = CATEGORIES.find(c=>c.id===id); return c ? c.name : id; }
function fmtPrice(p){ return '₹' + Number(p).toLocaleString('en-IN'); }

/* ---------------- Preloader ---------------- */
const preloaderStart = Date.now();
window.addEventListener('load', ()=>{
  const elapsed = Date.now() - preloaderStart;
  const remaining = Math.max(0, 800 - elapsed);
  setTimeout(()=>document.getElementById('preloader').classList.add('hide'), remaining);
});

/* ---------------- Dark mode ---------------- */
const html = document.documentElement;
if(localStorage.getItem('ftn_theme') === 'dark') html.classList.add('dark');
document.getElementById('darkToggle').addEventListener('click', ()=>{
  html.classList.toggle('dark');
  localStorage.setItem('ftn_theme', html.classList.contains('dark') ? 'dark' : 'light');
});

/* ---------------- Mobile menu ---------------- */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', (e)=>{
  e.stopPropagation();
  mobileMenu.classList.toggle('hidden');
});
document.querySelectorAll('.mnav').forEach(a=>a.addEventListener('click', ()=> mobileMenu.classList.add('hidden')));
// Close mobile menu when clicking outside
document.addEventListener('click', (e)=>{
  if(!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)){
    mobileMenu.classList.add('hidden');
  }
});

/* ---------------- Navbar shrink on scroll ---------------- */
const navbar = document.getElementById('navbar');
const navInner = navbar.querySelector('nav');
window.addEventListener('scroll', ()=>{
  const scrolled = window.scrollY > 40;
  if(scrolled){
    navInner.classList.add('shadow-soft');
    navInner.classList.remove('shadow-softer');
  } else {
    navInner.classList.add('shadow-softer');
    navInner.classList.remove('shadow-soft');
  }
});

/* ---------------- Reveal on scroll ---------------- */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); revealObserver.unobserve(e.target); } });
},{ threshold:0.15 });
function observeReveals(root=document){ root.querySelectorAll('.reveal:not(.in-view)').forEach(el=>revealObserver.observe(el)); }

/* ---------------- Scroll-to-top + progress ring ---------------- */
const scrollBtn = document.getElementById('scrollTopBtn');
const ring = document.getElementById('progressRing');
const RING_LEN = 150.8;
window.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? scrolled / max : 0;
  ring.style.strokeDashoffset = RING_LEN - (pct * RING_LEN);
  scrollBtn.classList.toggle('show', scrolled > 400);
});
scrollBtn.addEventListener('click', ()=> window.scrollTo({ top:0, behavior:'smooth' }));

/* ---------------- Toast ---------------- */
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> t.classList.remove('show'), 3000);
}

/* ---------------- Category grid ---------------- */
function renderCategories(){
  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = CATEGORIES.map(c => `
    <a href="#collection" data-cat="${c.id}" class="category-link reveal grow-card group bg-white dark:bg-forest-900 rounded-3xl p-5 flex flex-col items-center text-center shadow-softer hover:shadow-soft">
      <div class="img-zoom w-full h-24 rounded-2xl overflow-hidden mb-3">
        <img src="${c.img}" loading="lazy" alt="${c.name}" class="w-full h-full object-cover" />
      </div>
      <span class="text-2xl mb-1">${c.icon}</span>
      <span class="text-sm font-semibold text-forest-800 dark:text-cream">${c.name}</span>
    </a>
  `).join('');
  grid.querySelectorAll('.category-link').forEach(el=>{
    el.addEventListener('click', ()=>{
      sessionStorage.setItem('ftn_pending_cat', el.dataset.cat);
    });
  });
  observeReveals(grid);

  document.getElementById('footerCategories').innerHTML = CATEGORIES.map(c=>`<li><a href="#collection" class="hover:text-leaf-400 transition-colors footer-cat-link" data-cat="${c.id}">${c.name}</a></li>`).join('');
  document.querySelectorAll('.footer-cat-link').forEach(el=>{
    el.addEventListener('click', ()=>{
      sessionStorage.setItem('ftn_pending_cat', el.dataset.cat);
    });
  });
}

/* ---------------- Filter chips ---------------- */
let activeCategory = 'all';
let searchTerm = '';
function renderChips(){
  const wrap = document.getElementById('filterChips');
  const all = [{ id:'all', name:'All' }, ...CATEGORIES];
  wrap.innerHTML = all.map(c => `<button data-cat="${c.id}" class="chip ${c.id===activeCategory?'active':''} text-xs sm:text-sm font-semibold px-4 py-2 rounded-full bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-700 text-forest-700 dark:text-cream">${c.name}</button>`).join('');
  wrap.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=> applyCategoryFilter(btn.dataset.cat));
  });
}
function applyCategoryFilter(cat){
  activeCategory = cat;
  renderChips();
  renderProducts();
}

/* ---------------- Product grid ---------------- */
function renderProducts(){
  const grid = document.getElementById('productGrid');
  const noResults = document.getElementById('noResults');
  let list = PRODUCTS.filter(p => activeCategory==='all' || p.category===activeCategory);
  if(searchTerm.trim()){
    const q = searchTerm.trim().toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || catName(p.category).toLowerCase().includes(q));
  }
  noResults.classList.toggle('hidden', list.length !== 0);
  grid.innerHTML = list.map(p => `
    <div class="reveal grow-card bg-white dark:bg-forest-900 rounded-4xl overflow-hidden shadow-softer hover:shadow-soft">
      <div class="img-zoom relative h-56">
        <img src="${p.image}" loading="lazy" alt="${p.name}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=700&q=80';this.onerror=null;" />
        <span class="absolute top-3 left-3 text-[11px] font-semibold px-3 py-1 rounded-full ${p.stock ? 'bg-leaf-500 text-white' : 'bg-bark-500 text-white'}">${p.stock ? 'In Stock' : 'Out of Stock'}</span>
        <span class="absolute top-3 right-3 text-[11px] font-semibold px-3 py-1 rounded-full bg-white/90 text-forest-800">${catName(p.category)}</span>
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h3 class="font-display font-semibold text-lg text-forest-900 dark:text-cream">${p.name}</h3>
          <span class="font-display font-semibold text-leaf-600 whitespace-nowrap">${fmtPrice(p.price)}</span>
        </div>
        <p class="text-sm text-forest-500 dark:text-forest-300 mb-4 line-clamp-2">${p.description}</p>
        <button data-id="${p.id}" class="enquire-btn w-full ${p.stock ? 'btn-primary text-white' : 'bg-forest-100 dark:bg-forest-800 text-forest-400 cursor-not-allowed'} font-semibold py-2.5 rounded-full text-sm transition-all" ${p.stock ? '' : 'disabled'}>
          ${p.stock ? 'Buy / Enquire' : 'Currently Unavailable'}
        </button>
      </div>
    </div>
  `).join('');
  observeReveals(grid);
  grid.querySelectorAll('.enquire-btn:not([disabled])').forEach(btn=>{
    btn.addEventListener('click', ()=> openEnquiry(btn.dataset.id));
  });
}

/* ---------------- Enquiry modal ---------------- */
const enquiryModal = document.getElementById('enquiryModal');
function openEnquiry(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('enquiryProduct').textContent = `${p.name} · ${fmtPrice(p.price)}`;
  document.getElementById('enquiryWhatsapp').href = `https://wa.me/919999999999?text=${encodeURIComponent(`Hi! I'm interested in the ${p.name} (${fmtPrice(p.price)}). Is it available?`)}`;
  document.getElementById('enquiryCall').href = 'tel:+919999999999';
  enquiryModal.classList.remove('hidden'); enquiryModal.classList.add('flex');
}
document.getElementById('enquiryClose').addEventListener('click', ()=>{ enquiryModal.classList.add('hidden'); enquiryModal.classList.remove('flex'); });
document.getElementById('enquiryOverlay').addEventListener('click', ()=>{ enquiryModal.classList.add('hidden'); enquiryModal.classList.remove('flex'); });

/* ---------------- Search wiring ---------------- */
['navSearch','mobileSearch','collectionSearch'].forEach(id=>{
  const el = document.getElementById(id);
  el.addEventListener('input', (e)=>{
    searchTerm = e.target.value;
    document.querySelectorAll('#navSearch, #mobileSearch, #collectionSearch').forEach(inp=>{ if(inp.id!==id) inp.value = searchTerm; });
    window.location.hash = '#collection';
    renderProducts();
  });
  el.addEventListener('focus', ()=>{
    el.value = searchTerm;
  });
});

/* ---------------- Reviews ---------------- */
function renderReviews(){
  document.getElementById('reviewGrid').innerHTML = TESTIMONIALS.map(t => `
    <div class="reveal grow-card glass dark:glass-dark rounded-4xl p-6 shadow-softer">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-11 h-11 rounded-full bg-leaf-500/20 text-leaf-600 dark:text-leaf-400 font-display font-semibold flex items-center justify-center">${t.name.charAt(0)}</div>
        <div>
          <p class="font-semibold text-forest-800 dark:text-cream text-sm">${t.name}</p>
          <p class="text-xs text-forest-400">${t.location}</p>
        </div>
      </div>
      <div class="flex gap-0.5 mb-3 text-amber-400 text-sm">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
      <p class="text-sm text-forest-600 dark:text-forest-200 leading-relaxed">"${t.text}"</p>
    </div>
  `).join('');
  observeReveals(document.getElementById('reviewGrid'));
}

/* ---------------- FAQ ---------------- */
function renderFaqs(){
  const wrap = document.getElementById('faqList');
  wrap.innerHTML = FAQS.map((f,i) => `
    <div class="reveal faq-item bg-white dark:bg-forest-900 rounded-3xl shadow-softer overflow-hidden">
      <button class="faq-toggle w-full flex items-center justify-between gap-4 px-6 py-5 text-left" data-i="${i}">
        <span class="font-semibold text-forest-800 dark:text-cream">${f.q}</span>
        <svg class="faq-icon w-5 h-5 text-leaf-500 shrink-0 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      <div class="faq-panel hidden px-6 pb-5 text-sm text-forest-500 dark:text-forest-300 leading-relaxed">${f.a}</div>
    </div>
  `).join('');
  observeReveals(wrap);
  wrap.querySelectorAll('.faq-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const panel = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      const isOpen = !panel.classList.contains('hidden');
      wrap.querySelectorAll('.faq-panel').forEach(p=>p.classList.add('hidden'));
      wrap.querySelectorAll('.faq-icon').forEach(i=>i.style.transform='rotate(0deg)');
      if(!isOpen){ panel.classList.remove('hidden'); icon.style.transform='rotate(180deg)'; }
    });
  });
}

/* ---------------- Contact form ---------------- */
document.getElementById('contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  const subject = encodeURIComponent('TreeKart Enquiry from ' + name);
  const body = encodeURIComponent('Name: ' + name + '\nPhone: ' + phone + '\nEmail: ' + email + '\n\nMessage:\n' + message);
  window.location.href = 'mailto:hello@friendstreenursery.example?subject=' + subject + '&body=' + body;
  showToast('Opening email client… Message ready to send! 🌿');
  e.target.reset();
});

/* ==============================================================
   ADMIN
================================================================== */
const ADMIN_USER = atob('YWRtaW4='), ADMIN_PASS = atob('YWRtaW4xMjM=');
const adminLoginEl = document.getElementById('adminLogin');
const adminDashEl = document.getElementById('adminDashboard');

function isAdminAuthed(){ return sessionStorage.getItem('ftn_admin') === '1'; }
function refreshAdminView(){
  if(isAdminAuthed()){
    adminLoginEl.classList.add('hidden');
    adminDashEl.classList.remove('hidden');
    populateAdminCategorySelects();
    renderAdminTable();
  } else {
    adminLoginEl.classList.remove('hidden');
    adminDashEl.classList.add('hidden');
  }
}
document.getElementById('adminLoginForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPass').value.trim();
  if(u === ADMIN_USER && p === ADMIN_PASS){
    sessionStorage.setItem('ftn_admin','1');
    refreshAdminView();
    showToast('Welcome back! 🌱');
  } else {
    showToast('Invalid credentials. Please check your username and password.');
  }
});
document.getElementById('adminLogout').addEventListener('click', ()=>{
  sessionStorage.removeItem('ftn_admin');
  adminSearchTerm = '';
  adminCategoryTerm = 'all';
  document.getElementById('adminSearch').value = '';
  document.getElementById('adminCategoryFilter').value = 'all';
  refreshAdminView();
});

let adminSearchTerm = '', adminCategoryTerm = 'all';
function populateAdminCategorySelects(){
  const sel = document.getElementById('adminCategoryFilter');
  if(sel) sel.innerHTML = `<option value="all">All Categories</option>` + CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  const pSel = document.getElementById('pCategory');
  if(pSel) pSel.innerHTML = CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}
document.getElementById('adminSearch').addEventListener('input', e=>{ adminSearchTerm = e.target.value; renderAdminTable(); });
document.getElementById('adminCategoryFilter').addEventListener('change', e=>{ adminCategoryTerm = e.target.value; renderAdminTable(); });

function renderAdminTable(){
  document.getElementById('statTotal').textContent = PRODUCTS.length;
  document.getElementById('statInStock').textContent = PRODUCTS.filter(p=>p.stock).length;
  document.getElementById('statOut').textContent = PRODUCTS.filter(p=>!p.stock).length;

  let list = PRODUCTS.filter(p => adminCategoryTerm==='all' || p.category===adminCategoryTerm);
  if(adminSearchTerm.trim()){
    const q = adminSearchTerm.trim().toLowerCase();
    list = list.filter(p=>p.name.toLowerCase().includes(q));
  }
  const body = document.getElementById('adminTableBody');
  body.innerHTML = list.map(p => `
    <tr class="text-forest-700 dark:text-cream">
      <td class="px-4 py-3"><img src="${p.image}" class="w-12 h-12 rounded-xl object-cover" loading="lazy" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=100&q=80';this.onerror=null;"/></td>
      <td class="px-4 py-3 font-semibold">${p.name}</td>
      <td class="px-4 py-3 text-forest-500 dark:text-forest-300">${catName(p.category)}</td>
      <td class="px-4 py-3">${fmtPrice(p.price)}</td>
      <td class="px-4 py-3">
        <button data-id="${p.id}" class="toggle-stock-btn text-xs font-semibold px-3 py-1 rounded-full ${p.stock ? 'bg-leaf-500/15 text-leaf-600' : 'bg-bark-500/15 text-bark-500'}">${p.stock ? 'In Stock' : 'Sold Out'}</button>
      </td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        <button data-id="${p.id}" class="edit-btn text-leaf-600 hover:underline text-xs font-semibold mr-3">Edit</button>
        <button data-id="${p.id}" class="delete-btn text-bark-500 hover:underline text-xs font-semibold">Delete</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="6" class="text-center py-10 text-forest-400">No products found.</td></tr>`;

  body.querySelectorAll('.toggle-stock-btn').forEach(b=>b.addEventListener('click', ()=>{
    const p = PRODUCTS.find(x=>x.id===b.dataset.id); p.stock = !p.stock;
    saveProducts(PRODUCTS); renderAdminTable(); renderProducts();
    showToast(`${p.name} marked as ${p.stock ? 'In Stock' : 'Sold Out'}`);
  }));
  body.querySelectorAll('.delete-btn').forEach(b=>b.addEventListener('click', ()=>{
    const p = PRODUCTS.find(x=>x.id===b.dataset.id);
    if(confirm(`Delete "${p.name}"? This cannot be undone.`)){
      PRODUCTS = PRODUCTS.filter(x=>x.id!==b.dataset.id);
      saveProducts(PRODUCTS); renderAdminTable(); renderProducts();
      showToast('Product deleted.');
    }
  }));
  body.querySelectorAll('.edit-btn').forEach(b=>b.addEventListener('click', ()=> openProductModal(b.dataset.id)));
}

/* ---------------- Product modal (add/edit) ---------------- */
const productModal = document.getElementById('productModal');
function openProductModal(id){
  document.getElementById('productForm').reset();
  if(id){
    const p = PRODUCTS.find(x=>x.id===id);
    document.getElementById('productModalTitle').textContent = 'Edit Tree';
    document.getElementById('pId').value = p.id;
    document.getElementById('pImage').value = p.image;
    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pDesc').value = p.description;
    document.getElementById('pStock').checked = p.stock;
  } else {
    document.getElementById('productModalTitle').textContent = 'Add New Tree';
    document.getElementById('pId').value = '';
    document.getElementById('pStock').checked = true;
  }
  productModal.classList.remove('hidden'); productModal.classList.add('flex');
}
function closeProductModal(){ productModal.classList.add('hidden'); productModal.classList.remove('flex'); }
document.getElementById('openAddProduct').addEventListener('click', ()=> openProductModal(null));
document.getElementById('productModalClose').addEventListener('click', closeProductModal);
document.getElementById('productOverlay').addEventListener('click', closeProductModal);

document.getElementById('productForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = document.getElementById('pId').value;
  const data = {
    name: document.getElementById('pName').value.trim(),
    price: Number(document.getElementById('pPrice').value),
    category: document.getElementById('pCategory').value,
    description: document.getElementById('pDesc').value.trim(),
    image: document.getElementById('pImage').value.trim(),
    stock: document.getElementById('pStock').checked,
  };
  if(id){
    const idx = PRODUCTS.findIndex(x=>x.id===id);
    PRODUCTS[idx] = { ...PRODUCTS[idx], ...data };
    showToast('Tree updated successfully.');
  } else {
    PRODUCTS.unshift({ id: crypto.randomUUID(), ...data });
    showToast('New tree added to the collection! 🌳');
  }
  saveProducts(PRODUCTS);
  closeProductModal();
  renderAdminTable();
  renderProducts();
});

/* ==============================================================
   ROUTING (hash-based show/hide between main site and admin)
================================================================== */
function handleRoute(){
  const isAdmin = window.location.hash.startsWith('#admin');
  document.getElementById('site').classList.toggle('hidden', isAdmin);
  document.getElementById('admin').classList.toggle('hidden', !isAdmin);
  if(isAdmin){ refreshAdminView(); window.scrollTo(0,0); }
  // Apply pending category filter from footer/category clicks
  const pendingCat = sessionStorage.getItem('ftn_pending_cat');
  if(pendingCat && !isAdmin){
    applyCategoryFilter(pendingCat);
    sessionStorage.removeItem('ftn_pending_cat');
  }
}
window.addEventListener('hashchange', handleRoute);

/* ---------------- Cleanup on page hide ---------------- */
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden) revealObserver.disconnect();
});

/* ---------------- Init ---------------- */
const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();
renderCategories();
renderChips();
renderProducts();
renderReviews();
renderFaqs();
observeReveals();
handleRoute();

// ---- LilGhost Studio · código compartido del catálogo y la página de producto ----
// La URL del Apps Script (window.API_URL) y el primer pedido (window.catalogRequest)
// se definen al inicio del <head> de cada página para que la carga empiece antes.

// Número de WhatsApp para pedidos (código de país + número, sin espacios ni +).
const WHATSAPP = '527711948929';
const WA_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8.7 19L3 21z"/><path d="M8.5 9.5c.3 2.5 2.5 4.7 5 5"/></svg>';
const PLACEHOLDER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>';
const TINTS = ["#FFE27A","#BFD7FF","#FFC2DC","#BDEBC8","#FFC9BF"];

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function formatPrice(value){
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? '$' + n.toLocaleString('es-MX') + ' <small>MXN</small>' : '';
}

function photosOf(p){
  if(Array.isArray(p.photos)) return p.photos.filter(Boolean);
  return p.photo ? [p.photo] : [];
}

// Versión grande de una foto de Google Drive, para verla con zoom.
function bigPhoto(src){
  return String(src).replace(/([?&]sz=)w\d+/, '$1w2000');
}

function productUrl(p){
  return 'producto.html?id=' + encodeURIComponent(p.id);
}

function orderLink(p){
  const text = p.available
    ? `Hola, me interesa la tarjeta "${p.name}" que vi en el catálogo de LilGhost Studio.`
    : `Hola, quiero saber cuándo vuelve a estar disponible la tarjeta "${p.name}".`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

// Si una foto no carga (enlace roto o sin permiso), muestra el ícono.
function fallbackOnError(root){
  root.querySelectorAll('.photo img').forEach(img => img.addEventListener('error', () => {
    img.parentElement.innerHTML = PLACEHOLDER;
  }));
}

// Galería deslizable: con el dedo en celular/iPad; flechas en computadora.
// onChange(i) se llama cuando cambia la foto visible.
function setupGallery(gallery, onChange){
  const slides = gallery.querySelector('.slides');
  const dots = gallery.querySelectorAll('.dots span');
  const prev = gallery.querySelector('.prev');
  const next = gallery.querySelector('.next');
  const count = slides.children.length;
  const current = () => Math.round(slides.scrollLeft / slides.clientWidth);
  const go = i => slides.scrollTo({ left: Math.max(0, Math.min(count - 1, i)) * slides.clientWidth, behavior: 'smooth' });
  let last = 0;
  slides.addEventListener('scroll', () => {
    const i = current();
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    if(prev) prev.disabled = i === 0;
    if(next) next.disabled = i === count - 1;
    if(i !== last){ last = i; if(onChange) onChange(i); }
  }, { passive: true });
  if(prev) prev.addEventListener('click', () => go(current() - 1));
  if(next) next.addEventListener('click', () => go(current() + 1));
  return { go, current };
}

// ---- Catálogo guardado en el dispositivo ----
// Se muestra al instante en la siguiente visita mientras llega la versión nueva.
const CACHE_KEY = 'lilghost-catalogo-v1';
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días

function readCache(){
  try{
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if(saved && Array.isArray(saved.data) && Date.now() - saved.time < CACHE_MAX_AGE) return saved.data;
  }catch(e){}
  return null;
}

function writeCache(data){
  try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data })); }catch(e){}
}

// Llama a onData(lista, final, cambió): primero con el catálogo guardado (final = false)
// y luego con el de Google (final = true). Llama a onError solo si no hay nada que mostrar.
async function loadProducts(onData, onError){
  const cached = readCache();
  if(cached) onData(cached, false, true);
  try{
    const data = await (window.catalogRequest || fetch(`${window.API_URL}?action=catalog`).then(r => r.json()));
    if(!Array.isArray(data)) throw new Error('respuesta inesperada');
    writeCache(data);
    onData(data, true, !cached || JSON.stringify(cached) !== JSON.stringify(data));
  }catch(err){
    if(cached) onData(cached, true, false); // Sin conexión: se queda lo guardado.
    else onError(err);
  }
}

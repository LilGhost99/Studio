// ---- Portada: "construimos tu página en vivo" ----
// Un cursor con el fantasmita de LilGhost arma una página dentro de una ventana:
// escribe el nombre, arrastra bloques (título, botón, fotos, citas), elige color y publica.
// Luego empieza otra con un negocio distinto. Se pausa fuera de pantalla.
// Con "reducir movimiento" se muestra la página ya terminada, sin animación.
(function(){
  var B = document.querySelector('.builder');
  if(!B) return;
  var $ = function(s){ return B.querySelector(s); };
  var cursor = $('.b-cursor'), drag = $('.b-drag'), page = $('.b-page'), toast = $('.b-toast');
  var nameEl = $('.b-name'), hEl = $('.b-h'), btnEl = $('.b-btn'), urlEl = $('.b-url'), pub = $('.b-pub');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var NEGOCIOS = [
    { n: 'Barbería Norte',  h: 'Tu estilo empieza aquí',    b: 'Agenda tu cita',    ac: '#A3E635', fondo: 'oscuro', url: 'barberianorte.com' },
    { n: 'Tacos El Güero',  h: 'Sabor que te hace volver',  b: 'Pide por WhatsApp', ac: '#F97316', fondo: 'claro',  url: 'tacoselguero.com' },
    { n: 'Café Aroma',      h: 'Tu café de cada día',       b: 'Ver el menú',       ac: '#EC4899', fondo: 'crema',  url: 'cafearoma.com' }
  ];

  // ---------- utilidades ----------
  var visible = true;
  var dormir = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  function esperarVisible(){
    if(visible && !document.hidden) return Promise.resolve();
    return new Promise(function(r){
      var t = setInterval(function(){ if(visible && !document.hidden){ clearInterval(t); r(); } }, 250);
    });
  }
  async function pausa(ms){ await esperarVisible(); await dormir(ms); }

  var pos = { x: 0, y: 0 };
  function centro(el, dx, dy){
    var b = B.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - b.left + r.width * (dx == null ? .5 : dx), y: r.top - b.top + r.height * (dy == null ? .5 : dy) };
  }
  function colocar(el, p){ el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)'; }
  async function mover(p, conDrag){
    await esperarVisible();
    var d = Math.hypot(p.x - pos.x, p.y - pos.y);
    var ms = Math.max(380, Math.min(950, d * 1.6));
    cursor.style.transitionDuration = ms + 'ms';
    if(conDrag){ drag.style.transitionDuration = ms + 'ms'; colocar(drag, { x: p.x + 10, y: p.y + 6 }); }
    colocar(cursor, p);
    pos = p;
    await dormir(ms + 40);
  }
  async function clic(){
    cursor.classList.add('click');
    await dormir(170);
    cursor.classList.remove('click');
    await dormir(80);
  }
  async function escribir(el, texto, vel){
    el.textContent = '';
    el.classList.add('typing');
    for(var i = 1; i <= texto.length; i++){
      await esperarVisible();
      el.textContent = texto.slice(0, i);
      await dormir(vel + Math.random() * 40);
    }
    el.classList.remove('typing');
  }

  function reiniciar(){
    page.classList.remove('listo');
    page.dataset.fondo = 'neutro';
    page.style.setProperty('--ac', '#9CA3AF');
    B.querySelectorAll('.b-slot').forEach(function(s){ s.classList.remove('on'); });
    B.querySelectorAll('.b-sw i').forEach(function(s){ s.classList.remove('sel'); });
    nameEl.textContent = ''; hEl.textContent = '';
    urlEl.textContent = 'nueva-pagina';
    pub.classList.remove('hecho');
    toast.classList.remove('on');
  }

  function terminado(n){
    page.dataset.fondo = n.fondo;
    page.style.setProperty('--ac', n.ac);
    B.querySelectorAll('.b-slot').forEach(function(s){ s.classList.add('on'); });
    nameEl.textContent = n.n; hEl.textContent = n.h; btnEl.textContent = n.b;
    urlEl.textContent = n.url;
    page.classList.add('listo');
  }

  async function construir(n){
    reiniciar();
    btnEl.textContent = n.b;
    var sw = B.querySelector('.b-sw i[data-c="' + n.ac + '"]');
    await pausa(500);

    // 1. Nombre del negocio
    await mover(centro(nameEl, .1, .5));
    await clic();
    await escribir(nameEl, n.n, 55);
    await pausa(250);

    // 2. Bloques: del menú lateral a su lugar
    var orden = ['titulo', 'boton', 'fotos', 'citas'];
    for(var i = 0; i < orden.length; i++){
      var k = orden[i];
      var chip = B.querySelector('.b-chip[data-k="' + k + '"]');
      var slot = B.querySelector('.b-slot[data-k="' + k + '"]');
      await mover(centro(chip));
      chip.classList.add('press');
      await clic();
      drag.innerHTML = chip.innerHTML;
      drag.style.transitionDuration = '0ms';
      colocar(drag, { x: pos.x + 10, y: pos.y + 6 });
      drag.classList.add('on');
      slot.classList.add('hint');
      await dormir(30);
      await mover(centro(slot), true);
      drag.classList.remove('on');
      chip.classList.remove('press');
      slot.classList.remove('hint');
      slot.classList.add('on');
      if(k === 'titulo') await escribir(hEl, n.h, 38);
      await pausa(260);
    }

    // 3. Color y fondo
    await mover(centro(sw));
    await clic();
    sw.classList.add('sel');
    page.style.setProperty('--ac', n.ac);
    page.dataset.fondo = n.fondo;
    await pausa(700);

    // 4. Publicar
    await mover(centro(pub));
    await clic();
    pub.classList.add('hecho');
    urlEl.textContent = n.url;
    page.classList.add('listo');
    toast.classList.add('on');
    await mover(centro(page, .62, .72));
    await pausa(2600);
  }

  async function ciclo(){
    var i = 0;
    pos = centro(page, .6, .7);
    cursor.style.transitionDuration = '0ms';
    colocar(cursor, pos);
    B.classList.add('vivo');
    for(;;){
      await construir(NEGOCIOS[i % NEGOCIOS.length]);
      page.classList.add('sale');
      await pausa(450);
      page.classList.remove('sale');
      i++;
    }
  }

  if(quieto){ terminado(NEGOCIOS[0]); return; }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ visible = e[0].isIntersecting; }, { threshold: .15 }).observe(B);
  }
  // Espera a que carguen las fuentes para medir bien las posiciones.
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function(){ setTimeout(ciclo, 300); });
})();

// ---- Carrusel de proyectos: flechas para avanzar ----
(function(){
  document.querySelectorAll('.carrusel').forEach(function(c){
    var pista = c.querySelector('.pista');
    var prev = c.querySelector('.car-prev'), next = c.querySelector('.car-next');
    if(!pista) return;
    function salto(){ var s = pista.querySelector('.slide'); return s ? s.getBoundingClientRect().width + 28 : 300; }
    function revisar(){
      if(prev) prev.disabled = pista.scrollLeft < 8;
      if(next) next.disabled = pista.scrollLeft + pista.clientWidth > pista.scrollWidth - 8;
    }
    if(prev) prev.addEventListener('click', function(){ pista.scrollBy({ left: -salto(), behavior: 'smooth' }); });
    if(next) next.addEventListener('click', function(){ pista.scrollBy({ left: salto(), behavior: 'smooth' }); });
    pista.addEventListener('scroll', revisar, { passive: true });
    window.addEventListener('resize', revisar);
    revisar();
  });
})();

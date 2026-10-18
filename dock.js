// ---- Dock (menú de abajo, estilo macOS) ----
// Inspirado en el Dock de React Bits (MIT).
// Compu: los íconos crecen al acercar el mouse (magnificación) y rebotan al tocarlos.
// Celular: barra fija tipo app; los íconos rebotan al tocarlos.
// Sin JavaScript sigue funcionando como menú normal (son enlaces).
(function(){
  var dock = document.querySelector('.dock');
  if(!dock) return;
  var items = [].slice.call(dock.querySelectorAll('.dock-item'));
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
  var conMouse = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Rebote al tocar (también en celular).
  items.forEach(function(it){
    it.addEventListener('click', function(){
      if(quieto.matches) return;
      it.classList.remove('bounce'); void it.offsetWidth; it.classList.add('bounce');
    });
    it.addEventListener('animationend', function(){ it.classList.remove('bounce'); });
  });

  // Magnificación solo con mouse.
  var BASE = 50, MAX = 72, ALCANCE = 170, RESORTE = 0.22;
  var panel = dock.querySelector('.dock-panel');
  var meta = items.map(function(){ return BASE; });
  var actual = meta.slice();
  var corriendo = false;

  function paso(){
    var sigue = false;
    items.forEach(function(it, i){
      actual[i] += (meta[i] - actual[i]) * RESORTE;
      if(Math.abs(meta[i] - actual[i]) > 0.2) sigue = true; else actual[i] = meta[i];
      it.style.setProperty('--size', actual[i].toFixed(1) + 'px');
    });
    if(sigue) requestAnimationFrame(paso); else corriendo = false;
  }
  function arrancar(){ if(!corriendo){ corriendo = true; requestAnimationFrame(paso); } }

  panel.addEventListener('mousemove', function(e){
    if(!conMouse.matches || quieto.matches || window.innerWidth <= 640) return;
    items.forEach(function(it, i){
      var r = it.getBoundingClientRect();
      var d = Math.abs(e.clientX - (r.left + r.width / 2));
      var t = Math.max(0, 1 - d / ALCANCE);
      // Curva suave (coseno) como en el Dock de macOS.
      meta[i] = BASE + (MAX - BASE) * (0.5 - 0.5 * Math.cos(Math.PI * t));
    });
    arrancar();
  });
  panel.addEventListener('mouseleave', function(){
    meta = items.map(function(){ return BASE; });
    arrancar();
  });
})();

// ---- Aparecer al bajar ----
// Las secciones entran con un deslizamiento suave cuando llegan a la pantalla.
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var piezas = document.querySelectorAll('.wrap > section, .tilt-grid > *, .prices > *, .uses > *, .steps > *, .price-info > *');
  if(!piezas.length) return;
  document.documentElement.classList.add('js-reveal');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  [].forEach.call(piezas, function(el){
    // Escalonado dentro de cada grupo de tarjetas.
    var i = Array.prototype.indexOf.call(el.parentElement.children, el);
    if(el.parentElement.matches('.tilt-grid, .prices, .uses, .steps, .price-info')) el.style.setProperty('--d', (i * 80) + 'ms');
    el.classList.add('reveal');
    io.observe(el);
  });
})();

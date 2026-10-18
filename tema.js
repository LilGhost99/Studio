// ---- Botón de modo claro / oscuro (.theme-toggle) ----
// Adaptado de AnimatedThemeToggler de Magic UI (MIT).
// Al tocarlo, el tema nuevo se abre como un círculo que crece desde el botón.
// La elección se guarda en el dispositivo; si nunca se elige, sigue al celular o la compu.
// (El tema inicial lo pone un script corto en el <head> para que no parpadee.)
(function(){
  var CLAVE = 'lg-tema';
  var raiz = document.documentElement;
  var sistema = window.matchMedia('(prefers-color-scheme: dark)');
  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  function guardado(){ try{ return localStorage.getItem(CLAVE); }catch(e){ return null; } }
  function guardar(t){ try{ localStorage.setItem(CLAVE, t); }catch(e){} }

  function pintarBotones(){
    var oscuro = raiz.dataset.theme === 'dark';
    document.querySelectorAll('.theme-toggle').forEach(function(b){
      b.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
      b.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      b.title = oscuro ? 'Modo claro' : 'Modo oscuro';
    });
  }

  function aplicar(t){
    raiz.dataset.theme = t;
    pintarBotones();
  }

  function cambiar(boton){
    var nuevo = raiz.dataset.theme === 'dark' ? 'light' : 'dark';
    guardar(nuevo);

    if(!document.startViewTransition || sinMovimiento.matches){ aplicar(nuevo); return; }

    var r = boton.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    var transicion = document.startViewTransition(function(){ aplicar(nuevo); });
    transicion.ready.then(function(){
      raiz.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radio + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function(){});
  }

  document.querySelectorAll('.theme-toggle').forEach(function(b){
    b.addEventListener('click', function(){ cambiar(b); });
  });

  // Si la persona nunca eligió, sigue los cambios del sistema.
  sistema.addEventListener('change', function(e){
    if(!guardado()) aplicar(e.matches ? 'dark' : 'light');
  });

  pintarBotones();
})();

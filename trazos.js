// ---- Portada: trazos de pluma y marcatexto que fluyen sobre el cuaderno ----
// Dibuja en <canvas class="trazos"> unas líneas suaves que se mueven solas.
// Se pausa cuando no se ve (ahorra batería) y queda quieto con "reducir movimiento".
(function(){
  var canvas = document.querySelector('canvas.trazos');
  if(!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var w = 0, h = 0, t = Math.random() * 100, visible = true, corriendo = false;

  // Cada trazo: color, grosor, opacidad, desplazamiento dentro de la banda y velocidad.
  function paleta(){
    var oscuro = document.documentElement.dataset.theme === 'dark';
    return {
      marca:  oscuro ? 'rgba(251,188,5,0.30)'  : 'rgba(255,214,10,0.55)',
      azul:   oscuro ? 'rgba(122,170,255,0.55)': 'rgba(66,133,244,0.55)',
      rosa:   oscuro ? 'rgba(255,120,180,0.50)': 'rgba(255,95,162,0.50)',
      tinta:  oscuro ? 'rgba(242,238,227,0.16)': 'rgba(17,17,17,0.14)'
    };
  }
  var trazos = [];
  function armar(){
    trazos = [];
    var n = w < 640 ? 16 : 26;
    for(var i = 0; i < n; i++){
      var tipo = i % 9 === 0 ? 'marca' : (i % 4 === 1 ? 'azul' : (i % 5 === 2 ? 'rosa' : 'tinta'));
      trazos.push({
        tipo: tipo,
        grosor: tipo === 'marca' ? (w < 640 ? 10 : 16) : (tipo === 'tinta' ? 1.2 : 2),
        off: (i / n - 0.5),
        vel: 0.12 + (i % 7) * 0.018,
        fase: i * 1.7
      });
    }
  }
  function medir(){
    var r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    armar();
  }

  function dibujar(){
    var col = paleta();
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var paso = w < 640 ? 18 : 24;
    // La banda cruza en diagonal: de abajo a la izquierda hacia arriba a la derecha.
    var anchoBanda = Math.min(h * 0.9, 520);
    for(var i = 0; i < trazos.length; i++){
      var s = trazos[i];
      ctx.beginPath();
      for(var x = -40; x <= w + 40; x += paso){
        var p = x / w;
        var base = h * (0.82 - 0.62 * p);               // diagonal
        var onda = Math.sin(p * 3.2 + t * s.vel + s.fase) * 34
                 + Math.sin(p * 7.1 - t * s.vel * 0.7 + s.fase * 0.5) * 14;
        var y = base + s.off * anchoBanda * (0.55 + 0.45 * Math.sin(p * 2.1 + t * 0.15)) + onda;
        if(x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = col[s.tipo];
      ctx.lineWidth = s.grosor;
      ctx.stroke();
    }
  }

  function cuadro(){
    if(!visible || document.hidden){ corriendo = false; return; }
    t += 0.016;
    dibujar();
    requestAnimationFrame(cuadro);
  }
  function arrancar(){
    if(quieto){ dibujar(); return; }
    if(!corriendo){ corriendo = true; requestAnimationFrame(cuadro); }
  }

  medir(); dibujar();
  var tm; window.addEventListener('resize', function(){ clearTimeout(tm); tm = setTimeout(function(){ medir(); dibujar(); }, 120); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ visible = e[0].isIntersecting; if(visible) arrancar(); }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) arrancar(); });
  // Si cambia el tema, redibuja con los colores nuevos.
  new MutationObserver(function(){ dibujar(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  arrancar();
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

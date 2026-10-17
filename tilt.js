// ---- Tarjeta con inclinación 3D (.tilt-card) ----
// Adaptado de TiltCard + Tilt + ClippedCircle de unlumen-ui (MIT, © 2026 Léo Wicki).
// - Inclinación: la tarjeta gira según dónde esté el mouse, con un resorte suave.
// - Círculo: al entrar el mouse, nace un círculo desde el cursor que invierte los colores.
// En celular (sin mouse) o con "reducir movimiento" no hace nada y la tarjeta se queda quieta.
(function(){
  var ROTACION = 11;      // grados máximos (rotationFactor del original)
  var RESORTE = 0.14;     // qué tan rápido alcanza al mouse (0–1): más bajo = más suave
  var puedeInclinar = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
                      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!puedeInclinar) return;

  document.querySelectorAll('.tilt-card').forEach(function(card){
    var circulo = card.querySelector('.tilt-circle');
    var meta = { x: 0, y: 0 }, actual = { x: 0, y: 0 }, corriendo = false;

    function paso(){
      actual.x += (meta.x - actual.x) * RESORTE;
      actual.y += (meta.y - actual.y) * RESORTE;
      // Igual que el original: Y del mouse → rotateX, X del mouse → rotateY (invertido).
      card.style.setProperty('--rx', (actual.y * ROTACION * 2).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (-actual.x * ROTACION * 2).toFixed(2) + 'deg');
      if(Math.abs(meta.x - actual.x) + Math.abs(meta.y - actual.y) > 0.001){
        requestAnimationFrame(paso);
      } else {
        corriendo = false;
      }
    }
    function arrancar(){ if(!corriendo){ corriendo = true; requestAnimationFrame(paso); } }

    function posicion(e){
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      meta.x = px - 0.5; meta.y = py - 0.5;
      if(circulo){
        circulo.style.left = (px * 100) + '%';
        circulo.style.top = (py * 100) + '%';
      }
      arrancar();
    }

    card.addEventListener('pointerenter', function(e){
      card.classList.add('tilting');
      posicion(e);
      if(circulo) circulo.classList.add('on');
    });
    card.addEventListener('pointermove', posicion);
    card.addEventListener('pointerleave', function(){
      card.classList.remove('tilting');
      meta.x = 0; meta.y = 0;
      arrancar();
      if(circulo) circulo.classList.remove('on');
    });
  });
})();

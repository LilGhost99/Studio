// ---- Tarjeta con inclinación 3D (.tilt-card) ----
// Al mover el mouse encima, la tarjeta se inclina hacia el puntero.
// No hace nada en celular (no hay mouse) ni si el dispositivo pide "reducir movimiento".
(function(){
  var ROTACION = 11; // grados máximos de inclinación
  var puedeInclinar = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
                      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!puedeInclinar) return;

  document.querySelectorAll('.tilt-card').forEach(function(card){
    var cuadro = null;
    card.addEventListener('pointerenter', function(){ card.classList.add('tilting'); });
    card.addEventListener('pointermove', function(e){
      if(cuadro) return;
      cuadro = requestAnimationFrame(function(){
        cuadro = null;
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (x * ROTACION * 2).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-y * ROTACION * 2).toFixed(2) + 'deg');
      });
    });
    card.addEventListener('pointerleave', function(){
      card.classList.remove('tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

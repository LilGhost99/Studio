// ---- Configurador "Imagina tu página" ----
// El cliente escribe su negocio, elige giro, color y modo, y ve su página de ejemplo al instante.
// Al final, el botón abre WhatsApp con todo lo que eligió.
(function(){
  var root = document.getElementById('configurador');
  if(!root) return;
  var $ = function(s){ return root.querySelector(s); };

  var GIROS = {
    barberia:    { titulo: 'Tu estilo empieza aquí',        cta: 'Agenda tu cita',      servicios: ['Corte', 'Corte y barba', 'Diseño'],             icono: 'tijeras' },
    restaurante: { titulo: 'Sabor que te hace volver',       cta: 'Ver menú y pedir',    servicios: ['Desayunos', 'Comida del día', 'Para llevar'],   icono: 'plato' },
    cafeteria:   { titulo: 'Tu café de cada día',            cta: 'Pide para llevar',    servicios: ['Café de especialidad', 'Postres', 'Frappés'],   icono: 'taza' },
    estetica:    { titulo: 'Luce increíble hoy',             cta: 'Agenda tu cita',      servicios: ['Uñas', 'Pestañas', 'Tinte y peinado'],          icono: 'brillo' },
    tienda:      { titulo: 'Lo que buscas, a un mensaje',    cta: 'Pide por WhatsApp',   servicios: ['Novedades', 'Más vendidos', 'Ofertas'],         icono: 'bolsa' },
    consultorio: { titulo: 'Tu salud en buenas manos',       cta: 'Agenda tu consulta',  servicios: ['Consulta general', 'Seguimiento', 'Estudios'],  icono: 'cruz' }
  };
  var NOMBRES_GIRO = { barberia: 'Barbería', restaurante: 'Restaurante', cafeteria: 'Cafetería', estetica: 'Estética', tienda: 'Tienda', consultorio: 'Consultorio' };
  var ICONOS = {
    tijeras: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
    plato:   '<circle cx="12" cy="13" r="7"/><path d="M3 4v5a2 2 0 0 0 2 2M5 4v16M21 4c-1.5 1-2 3-2 5s1 3 2 3v8"/>',
    taza:    '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>',
    brillo:  '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    bolsa:   '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    cruz:    '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>'
  };

  // Texto oscuro o claro sobre el color elegido, el que tenga más contraste.
  function luz(hex){
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var f = function(c){ c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
  }
  function sobre(hex){
    var L = luz(hex);
    return (L + .05) / (0 + .05) > (1.05) / (L + .05) ? '#111111' : '#ffffff';
  }

  var nombre = $('#cfg-nombre'), vista = $('.cfg-phone'), pedir = $('#cfg-pedir');

  function valor(n){ var el = root.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; }

  function pintar(){
    var giro = valor('cfg-giro') || 'barberia';
    var color = valor('cfg-color') || '#A3E635';
    var modo = valor('cfg-modo') || 'oscuro';
    var g = GIROS[giro];
    var nom = (nombre.value || '').trim() || 'Tu Negocio';

    vista.style.setProperty('--acento', color);
    vista.style.setProperty('--sobre-acento', sobre(color));
    vista.dataset.modo = modo;

    $('.cfg-nom').textContent = nom;
    $('.cfg-ini').textContent = nom.charAt(0).toUpperCase();
    $('.cfg-titulo').textContent = g.titulo;
    $('.cfg-cta').textContent = g.cta;
    $('.cfg-giro-tag').textContent = NOMBRES_GIRO[giro] + ' · Pachuca';
    root.querySelectorAll('.cfg-ico').forEach(function(s){ s.innerHTML = ICONOS[g.icono]; });
    var lis = root.querySelectorAll('.cfg-serv li span');
    g.servicios.forEach(function(s, i){ if(lis[i]) lis[i].textContent = s; });
    $('.cfg-para').textContent = nom;

    var msj = 'Hola, quiero una página como la del configurador:\n' +
              '• Negocio: ' + nom + '\n' +
              '• Giro: ' + NOMBRES_GIRO[giro] + '\n' +
              '• Color: ' + color.toUpperCase() + '\n' +
              '• Modo: ' + (modo === 'oscuro' ? 'Oscuro' : 'Claro');
    pedir.href = 'https://wa.me/527711948929?text=' + encodeURIComponent(msj);
  }

  // Color libre (selector de color)
  var libre = $('#cfg-color-libre'), radioLibre = $('#cfg-color-x');
  if(libre && radioLibre){
    libre.addEventListener('input', function(){ radioLibre.value = libre.value; radioLibre.checked = true; pintar(); });
  }

  root.addEventListener('input', pintar);
  root.addEventListener('change', pintar);
  pintar();
})();

/* ================================================
   DEJOIY — main.js v8
   Nav, reveals, jelly hero, :D intro, contact form.
================================================ */
;(function () {
  'use strict';

  initPageTransitions();

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initReveal();
    initSwap();
    initContactForm();
    initAppTabs();
    initRibbons();
    initShapeRibbons();
    initHeroSlider();
    initTilt();
  });

  /* ── Nav: shadow on scroll, mobile menu ── */
  function initNav() {
    var nav = document.getElementById('nav');
    var burger = document.getElementById('burger');
    var menu = document.getElementById('menu');
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 24); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (!burger || !menu) return;
    function setOpen(open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { setOpen(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ── Scroll reveals ── */
  function initReveal() {
    var els = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Photo swap (founder's spirit animal) ── */
  function initSwap() {
    document.querySelectorAll('[data-swap]').forEach(function (btn) {
      var img = document.getElementById(btn.getAttribute('data-for'));
      if (!img) return;
      btn.addEventListener('click', function () {
        var toB = btn.getAttribute('aria-pressed') !== 'true';
        img.style.opacity = '0';
        setTimeout(function () {
          img.src = btn.getAttribute(toB ? 'data-b' : 'data-a');
          img.alt = btn.getAttribute(toB ? 'data-b-alt' : 'data-a-alt');
          img.style.opacity = '1';
        }, 250);
        btn.setAttribute('aria-pressed', String(toB));
        btn.textContent = toB ? 'Original photo' : 'Spirit animal';
      });
    });
  }

  /* ── Legal hub: one tab per app, deep-linkable as /legal#dmail ── */
  function initAppTabs() {
    var tabs = [].slice.call(document.querySelectorAll('.apptab'));
    if (!tabs.length) return;
    function show(key, focus) {
      var found = tabs.some(function (t) { return t.getAttribute('data-tab') === key; });
      if (!found) key = 'all';
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === key;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById('panel-' + t.getAttribute('data-tab')).hidden = !on;
        if (on && focus) t.focus();
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { var k = t.getAttribute('data-tab'); show(k); history.replaceState(null, '', '#' + k); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = tabs[(i + d + tabs.length) % tabs.length];
        show(n.getAttribute('data-tab'), true);
      });
    });
    show(location.hash.slice(1));
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
  }

  /* ── Contact form → /api/contact ── */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = document.getElementById('cf-status');
    var btn = document.getElementById('cf-submit');
    var label = btn.innerHTML;
    function show(msg, ok) { status.className = 'status ' + (ok ? 'ok' : 'err'); status.textContent = msg; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      ['cf-first', 'cf-email', 'cf-message'].forEach(function (id) {
        var f = document.getElementById(id);
        var invalid = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
        f.setAttribute('aria-invalid', String(invalid));
        if (invalid && !bad) bad = f;
      });
      if (bad) { show('Please fill in your name, a valid email and a message.', false); bad.focus(); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.success) { show('Message sent. We will reply within one working day.', true); form.reset(); }
          else show(d.error || 'We could not send that. Please try again.', false);
        })
        .catch(function () { show('Connection failed. Please try again, or email connect@dejoiy.com.', false); })
        .finally(function () { btn.disabled = false; btn.innerHTML = label; });
    });
  }

  /* ══════════════════════════
     LIGHT RIBBONS HERO
     Silky neon ribbons in DEJOIY colours drift across a deep blue sky
     (raw WebGL, one fragment shader). Used on the home hero and page heroes.
  ══════════════════════════ */
  var RIBBON_FRAG = [
    'precision highp float;',
    'uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;',
    // returns how strongly this ribbon covers the pixel; colours are mixed (not added) so pink stays pink
    'float ribbon(vec2 uv, float seed, float amp, float freq, float speed, float off, out float glow) {',
    '  float t = uTime * speed + seed * 6.2831;',
    '  float y = off + sin(uv.x * freq + t) * amp + sin(uv.x * freq * 0.47 - t * 0.7 + seed * 3.0) * amp * 0.6;',
    '  y += (uMouse.y - 0.5) * 0.08 * sin(uv.x * 2.0 + seed);',
    '  float w = 0.045 + 0.04 * sin(uv.x * freq * 0.8 + t * 1.3 + seed * 5.0);',
    '  float d = abs(uv.y - y);',
    '  glow = 0.01 / (d + 0.01);',
    '  float core = smoothstep(w, 0.0, d);',
    '  float edge = smoothstep(w * 0.25, 0.0, abs(d - w * 0.75)) * 0.6;',
    '  return clamp(core * 0.8 + edge, 0.0, 1.0);',
    '}',
    'vec3 lay(vec3 c, vec3 col, float a, float g) { return mix(c, col, a) + col * g * 0.12; }',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  uv.x *= uRes.x / uRes.y;',
    // deep blue night, brighter towards the top right
    '  vec2 q = gl_FragCoord.xy / uRes;',
    '  vec3 c = mix(vec3(0.02, 0.06, 0.28), vec3(0.11, 0.28, 0.9), smoothstep(0.0, 1.3, q.x * 0.6 + q.y * 0.8));',
    '  float g;',
    '  float a1 = ribbon(uv, 0.85, 0.12, 1.9, 0.31, 0.22, g); c = lay(c, vec3(1.0, 0.48, 0.18), a1 * 0.9, g);',   // orange
    '  float a2 = ribbon(uv, 0.37, 0.20, 1.6, 0.28, 0.55, g); c = lay(c, vec3(1.0, 0.31, 0.64), a2, g);',        // hot pink
    '  float a3 = ribbon(uv, 0.10, 0.16, 2.1, 0.35, 0.34, g); c = lay(c, vec3(0.83, 1.0, 0.23), a3, g);',        // lime
    '  float a4 = ribbon(uv, 0.62, 0.14, 2.6, 0.42, 0.72, g); c = lay(c, vec3(0.24, 0.80, 1.0), a4, g);',        // sky
    '  float a5 = ribbon(uv, 0.21, 0.10, 3.1, 0.50, 0.86, g); c = lay(c, vec3(1.0), a5 * 0.5, g * 0.5);',        // white silk
    '  c = min(c, vec3(1.0));',
    '  c *= 1.0 - 0.35 * smoothstep(0.4, 1.0, 1.0 - q.y);', // darker base for text contrast
    '  gl_FragColor = vec4(c, 1.0);',
    '}'
  ].join('\n');

  function initRibbons() {
    var hero = document.querySelector('.phero');
    if (!hero) return;
    var canvas = hero.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      hero.insertBefore(canvas, hero.firstChild);
    }
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return; // CSS gradient fallback stays
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, RIBBON_FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime'), uMouse = gl.getUniformLocation(prog, 'uMouse');
    hero.classList.add('has-webgl');

    var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75; // soft ribbons don't need full resolution
    function resize() {
      canvas.width = Math.round(hero.clientWidth * scale);
      canvas.height = Math.round(hero.clientHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);
    var mouse = [0.5, 0.5], target = [0.5, 0.5];
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    });

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var visible = true, running = false, t0 = performance.now();
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }).observe(hero);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    function draw(now) {
      mouse[0] += (target[0] - mouse[0]) * 0.05; mouse[1] += (target[1] - mouse[1]) * 0.05;
      gl.uniform1f(uTime, reduce ? 4.0 : (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(now) {
      if (!visible || document.hidden) { running = false; return; }
      draw(now);
      requestAnimationFrame(frame);
    }
    function start() {
      if (reduce) { draw(performance.now()); return; }   // one still frame
      if (!running) { running = true; requestAnimationFrame(frame); }
    }
    start();
  }

  /* ══════════════════════════
     SHAPE RIBBONS (home hero)
     Five silk ribbons float as waves, then gather into a shape for each slide:
     a frame around the dejoiy.com preview, a headset, the business portal's
     rings, an envelope, and Joi herself. 2D canvas, many thin strands per ribbon.
  ══════════════════════════ */
  var SHAPES = {
    frame: null, // built from the dejoiy.com preview card's position
    bag: 'M22 34 H78 L84 90 H16 Z M36 34 C36 10 64 10 64 34',
    headset: 'M18 62 C18 20 82 20 82 62 M12 58 H26 V86 H12 Z M74 58 H88 V86 H74 Z M81 86 C81 96 66 98 54 97',
    rings: 'M88.1 72 A44 18 30 1 0 11.9 28 A44 18 30 1 0 88.1 72 M88.1 28 A44 18 -30 1 0 11.9 72 A44 18 -30 1 0 88.1 28 M50 6 A44 18 90 1 0 50 94 A44 18 90 1 0 50 6',
    mail: 'M12 26 H88 V78 H12 Z M12 26 L50 56 L88 26 M12 78 L40 52 M88 78 L60 52',
    joi: 'M22 62 C22 40 30 30 38 28 L34 10 L48 24 C50 23.6 52 23.6 54 24 L66 10 L64 28 C74 32 80 44 80 62 C80 82 66 92 51 92 C36 92 22 82 22 62 Z M51 24 C48 15 55 11 59 15 M38 56 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M56 56 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M44 70 C48 75 54 75 58 70'
  };
  var RIBBONS = [
    { col: '212,255,58', amp: .16, freq: 2.1, speed: .35, off: .34, seed: .10 },  // lime
    { col: '255,79,163', amp: .20, freq: 1.6, speed: .28, off: .55, seed: .37 },  // pink
    { col: '60,203,255', amp: .14, freq: 2.6, speed: .42, off: .72, seed: .62 },  // sky
    { col: '255,122,47', amp: .12, freq: 1.9, speed: .31, off: .22, seed: .85 },  // orange
    { col: '255,255,255', amp: .10, freq: 3.1, speed: .50, off: .86, seed: .21 } // white
  ];

  function initShapeRibbons() {
    var hero = document.getElementById('hero3d');
    var canvas = document.getElementById('hero-canvas');
    if (!hero || !canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mock = document.getElementById('dejoiyMock');
    var N = 150, STRANDS = 7, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    var pathEl = document.createElementNS(svgNS, 'path');
    svg.appendChild(pathEl); hero.appendChild(svg);

    // Points along a path for every ribbon: each ribbon covers part of the outline, starting at its own place
    function sample(d, map) {
      pathEl.setAttribute('d', d);
      var L = pathEl.getTotalLength();
      return RIBBONS.map(function (r, i) {
        var pts = [];
        for (var k = 0; k < N; k++) {
          var p = pathEl.getPointAtLength(((i / RIBBONS.length + (k / (N - 1)) * 0.55) % 1) * L);
          pts.push(map(p.x, p.y));
        }
        return pts;
      });
    }
    function box() {
      var mobile = W < 980;
      var s = mobile ? Math.min(W * .5, H * .22) : Math.min(W * .36, H * .6);
      return { cx: mobile ? W * .68 : W * .74, cy: mobile ? H * .17 : H * .52, s: s };
    }
    var targets = {};
    function buildShapes() {
      var b = box();
      Object.keys(SHAPES).forEach(function (k) {
        if (k === 'frame') return;
        targets[k] = sample(SHAPES[k], function (x, y) { return [b.cx + (x - 50) / 100 * b.s, b.cy + (y - 50) / 100 * b.s]; });
      });
      // a rounded frame hugging the dejoiy.com preview (falls back to a bag on phones)
      if (mock && mock.offsetWidth && W >= 980) {
        var hr = hero.getBoundingClientRect(), r = mock.getBoundingClientRect(), pad = 18, rad = 34;
        var x = r.left - hr.left - pad, y = r.top - hr.top - pad, w = r.width + pad * 2, h = r.height + pad * 2;
        var d = 'M' + (x + rad) + ' ' + y + ' H' + (x + w - rad) + ' Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + rad) +
          ' V' + (y + h - rad) + ' Q' + (x + w) + ' ' + (y + h) + ' ' + (x + w - rad) + ' ' + (y + h) +
          ' H' + (x + rad) + ' Q' + x + ' ' + (y + h) + ' ' + x + ' ' + (y + h - rad) + ' V' + (y + rad) + ' Q' + x + ' ' + y + ' ' + (x + rad) + ' ' + y + ' Z';
        targets.frame = sample(d, function (px, py) { return [px, py]; });
      } else {
        targets.frame = targets.bag;
      }
    }
    function resize() {
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildShapes();
    }
    resize();
    window.addEventListener('resize', resize);
    hero.classList.add('has-webgl');

    // morph state: 0 = free waves, 1 = in the shape
    var shape = 'frame', morph = 0, morphTarget = 1, pending = null, lastT = 0;
    window.dejoiyRibbonShape = function (name) {
      if (name === shape && morphTarget === 1) return;
      pending = name; morphTarget = 0;               // let go, then gather into the new shape
    };
    var mouseY = .5;
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mouseY = (e.clientY - r.top) / r.height; });

    var pos = RIBBONS.map(function () { var a = []; for (var k = 0; k < N; k++) a.push([0, 0]); return a; });
    function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      // time-based: ~1.4 s to gather into a shape, ~0.5 s to let go
      var dt = Math.min(0.1, Math.max(0, t - (lastT || t))); lastT = t;
      if (morph < morphTarget) morph = Math.min(morphTarget, morph + dt / 1.4);
      if (morph > morphTarget) morph = Math.max(morphTarget, morph - dt / 0.5);
      if (morph === 0 && pending) { shape = pending; pending = null; morphTarget = 1; }
      var tgt = targets[shape] || targets.bag;
      RIBBONS.forEach(function (r, i) {
        var p = pos[i], tp = tgt[i];
        for (var k = 0; k < N; k++) {
          var u = k / (N - 1);
          var x = (-0.1 + 1.2 * u) * W;
          var xn = x / H;
          var wy = (r.off + Math.sin(xn * r.freq + t * r.speed + r.seed * 6.28) * r.amp +
            Math.sin(xn * r.freq * .47 - t * r.speed * .7 + r.seed * 3) * r.amp * .6 + (mouseY - .5) * .06 * Math.sin(xn * 2 + r.seed)) * H;
          // stagger so a ribbon gathers from one end to the other
          var m = ease(Math.max(0, Math.min(1, morph * 1.6 - u * .6)));
          var wob = Math.sin(t * 2 + u * 14 + i) * 3;
          p[k][0] = x + (tp[k][0] - x) * m;
          p[k][1] = wy + (tp[k][1] + wob - wy) * m;
        }
        // soft glow under the ribbon
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(' + r.col + ',' + (0.10 + morph * .06) + ')';
        ctx.lineWidth = 22 - morph * 8;
        // where a shape jumps to its next part (an eye, the smile), lift the pen instead of drawing a line across
        var jump = [];
        for (k = 1; k < N; k++) jump[k] = morph > .6 && Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]) > 34;
        ctx.beginPath();
        for (k = 0; k < N; k++) (k && !jump[k]) ? ctx.lineTo(p[k][0], p[k][1]) : ctx.moveTo(p[k][0], p[k][1]);
        ctx.stroke();
        // silk: thin strands spread across a width that twists along the ribbon
        for (var s = 0; s < STRANDS; s++) {
          var f = s / (STRANDS - 1) - .5;
          ctx.strokeStyle = 'rgba(' + r.col + ',' + (0.85 - Math.abs(f) * 0.9) + ')';
          ctx.lineWidth = s === (STRANDS >> 1) ? 2.2 : 1.1;
          ctx.beginPath();
          for (k = 0; k < N; k++) {
            var a = p[Math.max(0, k - 1)], b = p[Math.min(N - 1, k + 1)];
            var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
            var width = (16 - morph * 8) * Math.sin((k / N) * 9 + t * 1.3 + r.seed * 5);
            var ox = -dy / len * width * f, oy = dx / len * width * f;
            (k && !jump[k]) ? ctx.lineTo(p[k][0] + ox, p[k][1] + oy) : ctx.moveTo(p[k][0] + ox, p[k][1] + oy);
          }
          ctx.stroke();
        }
      });
    }
    var visible = true, running = false;
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) go(); }).observe(hero);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) go(); });
    function frame(now) {
      if (!visible || document.hidden) { running = false; return; }
      draw(now / 1000);
      requestAnimationFrame(frame);
    }
    function go() {
      if (reduce) { morph = 1; draw(4); return; }
      if (!running) { running = true; requestAnimationFrame(frame); }
    }
    if (reduce) window.dejoiyRibbonShape = function (name) { shape = name; morph = 1; draw(4); };
    setTimeout(go, 0);
  }

  /* ── Hero slider: the first word scrambles into the next one ── */
  function initHeroSlider() {
    var root = document.getElementById('heroSlider');
    if (!root) return;
    var slides = JSON.parse(root.getAttribute('data-slides'));
    var word = document.getElementById('heroWord');
    var lede = document.getElementById('heroLede');
    var cta = document.getElementById('heroCta');
    var dots = [].slice.call(root.querySelectorAll('.hs-dot'));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var GLYPHS = '!<>-_\\/[]{}=+*^?#:D';
    var i = 0, timer = null, scramble = null;

    function scrambleTo(text) {
      clearInterval(scramble);
      if (reduce) { word.textContent = text; return; }
      var from = word.textContent, len = Math.max(from.length, text.length), frame = 0;
      word.classList.add('glitch');
      scramble = setInterval(function () {
        var out = '';
        for (var k = 0; k < len; k++) {
          var settle = k * 1.6 + 6;                     // letters lock in left to right
          if (frame >= settle) out += text[k] || '';
          else if (frame < 4) out += from[k] || '';
          else out += text[k] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        word.textContent = out;
        if (++frame > len * 1.6 + 7) { clearInterval(scramble); word.textContent = text; word.classList.remove('glitch'); }
      }, 34);
    }
    function go(n, user) {
      i = (n + slides.length) % slides.length;
      var s = slides[i];
      scrambleTo(s.word);
      lede.classList.remove('swap-in'); void lede.offsetWidth; lede.classList.add('swap-in');
      lede.textContent = s.lede;
      cta.querySelector('span').textContent = s.cta;
      cta.href = s.href;
      if (/^https?:/.test(s.href)) { cta.target = '_blank'; cta.rel = 'noopener'; } else { cta.removeAttribute('target'); cta.removeAttribute('rel'); }
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      if (window.dejoiyRibbonShape) window.dejoiyRibbonShape(s.shape);
      document.getElementById('hero3d').setAttribute('data-slide', s.shape);
      root.style.setProperty('--hs-progress', '0');
      if (user) restart();
    }
    function restart() {
      clearInterval(timer);
      if (reduce) return;
      timer = setInterval(function () { go(i + 1); }, 4200);
    }
    root.querySelector('.hs-prev').addEventListener('click', function () { go(i - 1, true); });
    root.querySelector('.hs-next').addEventListener('click', function () { go(i + 1, true); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k, true); }); });
    var hero = document.getElementById('hero3d');
    hero.addEventListener('mouseenter', function () { clearInterval(timer); });
    hero.addEventListener('mouseleave', restart);
    hero.addEventListener('focusin', function () { clearInterval(timer); });
    restart();
  }

  // Gentle 3D tilt on the world cards (mouse only)
  function initTilt() {
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 9) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ══════════════════════════
     :D INTRO + PAGE TRANSITIONS
     Pink eye drops, then ink eye, then the D. A wink, a quarter turn
     into a smiley, and the curtain lifts. Full show once per session,
     a quick wink on later pages.
  ══════════════════════════ */
  function initPageTransitions() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var css = document.createElement('style');
    css.textContent =
      '#dj-intro{position:fixed;inset:0;z-index:300;background:#2f6bff;display:grid;place-items:center;pointer-events:none}' +
      '#dj-intro svg{width:min(46vmin,340px);overflow:visible}' +
      '#dj-intro .p{transform-box:fill-box;transform-origin:center}' +
      '#dj-intro.done{visibility:hidden}';
    document.head.appendChild(css);

    var ov = document.createElement('div');
    ov.id = 'dj-intro';
    ov.setAttribute('aria-hidden', 'true');
    // Same geometry as the logo mark: lime D-box, pink eye, ink eye, ink D
    ov.innerHTML =
      '<svg viewBox="-20 -40 200 200"><g class="p face">' +
        '<path class="p box" d="M18 -20H80A70 70 0 0 1 80 120H18A18 18 0 0 1 0 102V-2A18 18 0 0 1 18 -20Z" fill="#D4FF3A"/>' +
        '<g transform="translate(22 17) scale(.66)">' +
          '<circle class="p eye1" cx="13" cy="28" r="12" fill="#FF4FA3"/>' +
          '<circle class="p eye2" cx="13" cy="72" r="12" fill="#121212"/>' +
          '<path class="p mouth" fill-rule="evenodd" d="M38 0H88A50 50 0 0 1 88 100H38Z M62 26H86A24 24 0 0 1 86 74H62Z" fill="#121212"/>' +
        '</g></g></svg>';
    (document.body || document.documentElement).appendChild(ov);

    var q = function (s) { return ov.querySelector(s); };
    var face = q('.face'), box = q('.box'), e1 = q('.eye1'), e2 = q('.eye2'), mouth = q('.mouth');
    var ease = 'cubic-bezier(.34,1.56,.64,1)'; // springy overshoot

    function drop(el, delay) {
      return el.animate([
        { transform: 'translateY(-160vh)', opacity: 1 },
        { transform: 'translateY(0) scale(1.15,.8)', offset: .7 },
        { transform: 'translateY(-10%) scale(.95,1.08)', offset: .85 },
        { transform: 'translateY(0) scale(1,1)' }
      ], { duration: 520, delay: delay, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'backwards' });
    }
    function lift(delay) {
      var a = ov.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }],
        { duration: 520, delay: delay, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
      a.onfinish = function () { ov.classList.add('done'); };
    }

    function playEntry() {
      var seen = false;
      try { seen = sessionStorage.getItem('dj-intro') === '1'; sessionStorage.setItem('dj-intro', '1'); } catch (e) {}
      if (reduce || !ov.animate) { ov.classList.add('done'); return; }
      if (seen) { // quick: wink and lift
        e1.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.12)' }, { transform: 'scaleY(1)' }], { duration: 260, delay: 60 });
        lift(260);
        return;
      }
      box.animate([{ transform: 'scale(0) rotate(-20deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 420, easing: ease, fill: 'backwards' });
      drop(e1, 300);          // first eye
      drop(e2, 620);          // second eye
      drop(mouth, 940);       // then the D
      // wink with the pink eye
      e1.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }],
        { duration: 420, delay: 1620, easing: 'ease-in-out' });
      // quarter turn: ":D" becomes an upright smiley
      face.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(90deg)' }],
        { duration: 560, delay: 2120, easing: ease, fill: 'forwards' });
      lift(2800);
    }

    function playExit(href) {
      if (reduce || !ov.animate) { location.href = href; return; }
      ov.classList.remove('done');
      ov.getAnimations().forEach(function (a) { a.cancel(); });
      face.getAnimations().forEach(function (a) { a.cancel(); });
      ov.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 380, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
      face.animate([{ transform: 'scale(.4) rotate(-30deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 380, easing: ease, fill: 'forwards' });
      setTimeout(function () { location.href = href; }, 400);
    }

    // Internal same-site links get the curtain; anchors, new tabs and other sites don't
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto|tel):/.test(href)) return;
      var url = new URL(href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      playExit(url.href);
    }, true);

    // Back/forward cache: never show a stuck curtain
    window.addEventListener('pageshow', function (e) { if (e.persisted) ov.classList.add('done'); });

    playEntry();
  }

})();

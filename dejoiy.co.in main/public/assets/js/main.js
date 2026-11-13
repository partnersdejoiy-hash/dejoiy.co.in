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
    initThreeJS();
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
     THREE.JS — JELLY HERO (Gen-Z v4)
  ══════════════════════════ */
  function initThreeJS() {
    initHeroSwap();
    initTilt();
    var hero = document.getElementById('hero3d') || document.querySelector('.phero');
    if (!hero || typeof THREE === 'undefined') return;
    var mini = hero.id !== 'hero3d'; // inner pages get a smaller jelly on the right
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
       canvas.setAttribute('aria-hidden', 'true');
      hero.insertBefore(canvas, hero.firstChild);
    }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { return; } // CSS blob fallback stays visible
    hero.classList.add('has-webgl');

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xffe9d6, 0.7));
    var key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 4, 5); scene.add(key);
    var rimPink = new THREE.PointLight(0xff4fa3, 0.9, 20); rimPink.position.set(-4, -2, 3); scene.add(rimPink);
    var rimSun = new THREE.PointLight(0xd4ff3a, 0.9, 20); rimSun.position.set(4, -3, 2); scene.add(rimSun);

    // Soft candy studio for reflections (avoids black rims on the glossy edges)
    (function () {
      var c = document.createElement('canvas'); c.width = 256; c.height = 128;
      var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#9cc0ff'); gr.addColorStop(0.7, '#2f6bff'); gr.addColorStop(1, '#fff3e0');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
      var tex = new THREE.CanvasTexture(c); tex.mapping = THREE.EquirectangularReflectionMapping; tex.encoding = THREE.sRGBEncoding;
      var pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromEquirectangular(tex).texture;
      tex.dispose(); pm.dispose();
    })();
    var group = new THREE.Group(); scene.add(group);

    // Wobbly jelly blob: vertex displacement injected into a physical material
    var uniforms = { uTime: { value: 0 }, uAmp: { value: reduce ? 0.06 : 0.22 } };
    function lin(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
    var jellyMat = new THREE.MeshPhysicalMaterial({ color: lin(0x2f6bff), roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.6 });
    jellyMat.onBeforeCompile = function (shader) {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uAmp = uniforms.uAmp;
      shader.vertexShader = 'uniform float uTime; uniform float uAmp;\n' + shader.vertexShader.replace(
        '#include <begin_vertex>',
        'vec3 transformed = vec3(position);\n' +
        'float w = sin(position.x*2.1+uTime*1.3)*sin(position.y*2.4+uTime*1.1)*cos(position.z*1.9+uTime*0.9);\n' +
        'transformed += normal * w * uAmp;'
      );
    };
    var jelly = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 48), jellyMat);
    group.add(jelly);

    // Candy satellites in the brand colours
    var candy = [
      { geo: new THREE.TorusGeometry(0.42, 0.17, 24, 64), c: 0xff4fa3, p: [-2.4, 1.3, 0.6] },
      { geo: new THREE.SphereGeometry(0.34, 40, 40),      c: 0xd4ff3a, p: [2.3, 1.5, -0.4] },
      { geo: THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.22, 0.5, 8, 24) : new THREE.CylinderGeometry(0.22, 0.22, 0.8, 24), c: 0x4dd8ff, p: [2.1, -1.6, 0.8] },
      { geo: new THREE.TorusKnotGeometry(0.28, 0.1, 96, 16), c: 0xff8a3d, p: [-2.0, -1.5, -0.3] },
      { geo: new THREE.SphereGeometry(0.18, 32, 32),      c: 0xffffff, p: [0.4, 2.3, 1.0] }
    ];
    var sats = candy.map(function (d, i) {
      var m = new THREE.Mesh(d.geo, new THREE.MeshPhysicalMaterial({ color: lin(d.c), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }));
      m.position.fromArray(d.p);
      m.userData = { base: m.position.clone(), phase: i * 1.37 };
      group.add(m);
      return m;
    });

    // Layout: blob sits right on desktop, top-right on mobile
    function layout() {
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      var mobile = w < 960;
      if (mini) {
        group.position.set(mobile ? 1.6 : 3.1, mobile ? 1.9 : 0.2, 0);
        group.scale.setScalar(mobile ? 0.38 : 0.72);
      } else {
        group.position.set(mobile ? 1.1 : 2.7, mobile ? 2.55 : 0.05, 0);
        group.scale.setScalar(mobile ? 0.5 : 1);
      }
    }
    layout();
    window.addEventListener('resize', layout);

    // Pointer: parallax + drag to spin + "squish" on press
    var target = { x: 0, y: 0 }, spin = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
    var dragging = false, last = null, squish = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (dragging && last) { vel.y += (e.clientX - last.x) * 0.0009; vel.x += (e.clientY - last.y) * 0.0009; last = { x: e.clientX, y: e.clientY }; }
    });
    hero.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a,button')) return;
      dragging = true; last = { x: e.clientX, y: e.clientY }; squish = 1;
    });
    window.addEventListener('pointerup', function () { dragging = false; last = null; });

    // Only render while the hero is on screen and the tab is visible
    var visible = true;
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }).observe(hero);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && visible) loop(); });

    var clock = new THREE.Clock(), running = false;
    function loop() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }
    function frame() {
      if (!visible || document.hidden) { running = false; return; }
      var t = clock.getElapsedTime();
      uniforms.uTime.value = reduce ? t * 0.3 : t;
      squish *= 0.92;
      uniforms.uAmp.value = (reduce ? 0.06 : 0.22) + squish * 0.35;

      vel.x *= 0.94; vel.y *= 0.94;
      spin.x += vel.x; spin.y += vel.y + (reduce ? 0 : 0.0025);
      var scrollT = Math.min(window.scrollY / hero.clientHeight, 1);
      group.rotation.x += ((spin.x + target.y * 0.25 + scrollT * 0.8) - group.rotation.x) * 0.08;
      group.rotation.y += ((spin.y + target.x * 0.35) - group.rotation.y) * 0.08;
      jelly.scale.set(1 + squish * 0.08, 1 - squish * 0.1, 1 + squish * 0.08);

      sats.forEach(function (m, i) {
        var u = m.userData;
        m.position.y = u.base.y + Math.sin(t * 1.2 + u.phase) * 0.18;
        m.rotation.x = t * 0.6 + i; m.rotation.y = t * 0.4 + i;
      });
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    loop();
  }

  // Headline word that cycles through what DEJOIY does
  function initHeroSwap() {
    var el = document.getElementById('heroSwap');
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var words = ['scale', 'checkout', 'support', 'inbox', 'work'], i = 0;
    setInterval(function () {
      i = (i + 1) % words.length;
      el.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-40%)', opacity: 0 }], { duration: 220, easing: 'ease-in' }).onfinish = function () {
        el.textContent = words[i];
        el.animate([{ transform: 'translateY(40%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
      };
    }, 2400);
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

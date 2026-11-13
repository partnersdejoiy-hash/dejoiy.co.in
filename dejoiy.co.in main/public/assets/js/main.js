/* ================================================
   DEJOIY — Main JS v3.0
   BPO + Marketplace | YOU + JOY = DEJOIY
================================================ */
;(function () {
  'use strict';

  initPageTransitions();

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initScrollReveal();
    initCounters();
    initInnovationBars();
    initImageSwap();
    initThreeJS();
  });

  /* ══════════════════════════
     NAVIGATION
  ══════════════════════════ */
  function initNav() {
    var nav = document.getElementById('mainNav');
    var hamburger = document.getElementById('navHamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    var menuOpen = false;

    window.addEventListener('scroll', function () {
      if (!nav) return;
      if ((window.pageYOffset || document.documentElement.scrollTop) > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        menuOpen = !menuOpen;
        if (menuOpen) {
          hamburger.classList.add('open');
          hamburger.setAttribute('aria-expanded', 'true');
          mobileMenu.classList.add('open');
          document.body.style.overflow = 'hidden';
        } else {
          close();
        }
      });

      document.addEventListener('click', function (e) {
        if (menuOpen && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
          close();
        }
      });

      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', close);
      });
    }

    function close() {
      menuOpen = false;
      if (hamburger) { hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); }
      if (mobileMenu) { mobileMenu.classList.remove('open'); }
      document.body.style.overflow = '';
    }

    /* Active link */
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }

  /* ══════════════════════════
     SCROLL REVEAL
  ══════════════════════════ */
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    els.forEach(function (el) { obs.observe(el); });
  }

  /* ══════════════════════════
     ANIMATED COUNTERS
  ══════════════════════════ */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { obs.observe(el); });
  }

  function animateCounter(el) {
    var raw = el.getAttribute('data-target');
    if (!raw) return;
    var target = parseFloat(raw);
    var suffix = el.getAttribute('data-suffix') || '';
    var isDecimal = raw.indexOf('.') !== -1;
    var decimals = isDecimal ? (raw.split('.')[1] || '').length : 0;
    var duration = 2200;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var t = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var cur = target * eased;
      el.textContent = (isDecimal ? cur.toFixed(decimals) : Math.round(cur)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ══════════════════════════
     INNOVATION BARS
  ══════════════════════════ */
  function initInnovationBars() {
    var bars = document.querySelectorAll('.innovation-bar-fill');
    if (!bars.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(function (b) { obs.observe(b); });
  }

  /* ══════════════════════════
     IMAGE SWAP
  ══════════════════════════ */
  function initImageSwap() {
    document.querySelectorAll('[data-swap-image]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var state = btn.getAttribute('data-state');
        var card = btn.closest('.founder-feature-card');
        if (!card) return;
        var img = card.querySelector('.founder-img-wrap img');
        if (!img) return;

        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';

        setTimeout(function () {
          if (state === 'primary') {
            img.src = btn.getAttribute('data-alternate');
            img.alt = btn.getAttribute('data-alternate-alt') || '';
            btn.setAttribute('data-state', 'alternate');
            btn.textContent = 'Original Photo';
          } else {
            img.src = btn.getAttribute('data-primary');
            img.alt = btn.getAttribute('data-primary-alt') || '';
            btn.setAttribute('data-state', 'primary');
            btn.textContent = 'Spirit Animal';
          }
          img.style.opacity = '1';
        }, 300);
      });
    });
  }

  /* ══════════════════════════
     THREE.JS — JELLY HERO (Gen-Z v4)
  ══════════════════════════ */
  function initThreeJS() {
    initHeroSwap();
    initTilt();
    var hero = document.getElementById('hero3d') || document.querySelector('.page-hero-section');
    if (!hero || typeof THREE === 'undefined') return;
    var mini = hero.id !== 'hero3d'; // inner pages get a smaller jelly on the right
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'page-3d'; canvas.setAttribute('aria-hidden', 'true');
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

    scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x3a1238, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 4, 5); scene.add(key);
    var rimPink = new THREE.PointLight(0xff3d9a, 2.6, 20); rimPink.position.set(-4, -2, 3); scene.add(rimPink);
    var rimSun = new THREE.PointLight(0xc6ff3d, 1.2, 20); rimSun.position.set(4, -3, 2); scene.add(rimSun);

    // Soft candy studio for reflections (avoids black rims on the glossy edges)
    (function () {
      var c = document.createElement('canvas'); c.width = 256; c.height = 128;
      var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, '#cfe0ff'); gr.addColorStop(0.45, '#5b9bff'); gr.addColorStop(0.7, '#ff3d9a'); gr.addColorStop(1, '#2a1640');
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
    var jellyMat = new THREE.MeshPhysicalMaterial({ color: lin(0x3a6bff), roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.6 });
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
      { geo: new THREE.TorusGeometry(0.42, 0.17, 24, 64), c: 0xff3d9a, p: [-2.4, 1.3, 0.6] },
      { geo: new THREE.SphereGeometry(0.34, 40, 40),      c: 0xc6ff3d, p: [2.3, 1.5, -0.4] },
      { geo: THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.22, 0.5, 8, 24) : new THREE.CylinderGeometry(0.22, 0.22, 0.8, 24), c: 0x4dd8ff, p: [2.1, -1.6, 0.8] },
      { geo: new THREE.TorusKnotGeometry(0.28, 0.1, 96, 16), c: 0xff8a3d, p: [-2.0, -1.5, -0.3] },
      { geo: new THREE.SphereGeometry(0.18, 32, 32),      c: 0xb9a6ff, p: [0.4, 2.3, 1.0] }
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
     PAGE TRANSITIONS — RIDICULOUS EDITION
  ══════════════════════════ */
  function initPageTransitions() {
    var ov = document.createElement('div');
    ov.id = 'px-overlay';
    ov.innerHTML = '<canvas id="px-canvas"></canvas><div id="px-d">D</div><div id="px-flash"></div>';
    document.body.appendChild(ov);

    var styleEl = document.createElement('style');
    styleEl.textContent = [
      '#px-overlay{position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden}',
      '#px-canvas{position:absolute;inset:0;width:100%;height:100%}',
      '#px-d{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0) rotate(-180deg);',
      'font-family:"Bricolage Grotesque", sans-serif;font-weight:800;font-size:55vw;line-height:0.9;',
      'background:linear-gradient(135deg,#5b9bff,#ff5fa2,#3ee6b0);',
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;',
      'opacity:0;will-change:transform,opacity;user-select:none}',
      '#px-flash{position:absolute;inset:0;background:linear-gradient(135deg,#0b0a1a 0%,#2f7cf6 40%,#ff5fa2 70%,#3ee6b0 100%);opacity:0}'
    ].join('');
    document.head.appendChild(styleEl);

    var pxCanvas = document.getElementById('px-canvas');
    var ctx = pxCanvas.getContext('2d');
    var pxD = document.getElementById('px-d');
    var pxFlash = document.getElementById('px-flash');
    var W, H;

    function resize() { W = pxCanvas.width = window.innerWidth; H = pxCanvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    /* ---- ENTRY: Flash fades out + warp rings collapse, page revealed ---- */
    function playEntry() {
      /* Immediately cover with gradient flash so there's zero stuck frame */
      pxD.style.transition = 'none';
      pxD.style.opacity = '0';
      pxD.style.transform = 'translate(-50%,-50%) scale(0) rotate(-180deg)';
      pxFlash.style.transition = 'none';
      pxFlash.style.opacity = '1';

      var startTime = null;
      var dur = 700;
      var raf;

      function tick(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);

        ctx.clearRect(0, 0, W, H);

        /* Fade the gradient flash out as rings collapse */
        pxFlash.style.opacity = Math.max(0, 1 - ease * 1.4).toString();

        var maxR = Math.sqrt(W * W + H * H) * 0.7;
        var colors = ['#2f7cf6', '#ff5fa2', '#3ee6b0', '#2f7cf6', '#ff5fa2', '#3ee6b0'];
        for (var i = 0; i < 7; i++) {
          var frac = (i / 7);
          var r = maxR * (1 - ease) * (1 - frac * 0.3);
          var alpha = Math.max(0, (1 - p) * 0.9 - frac * 0.1);
          ctx.beginPath();
          ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
          ctx.strokeStyle = colors[i % colors.length];
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (p < 1) { raf = requestAnimationFrame(tick); }
        else {
          ctx.clearRect(0, 0, W, H);
          pxFlash.style.opacity = '0';
          cancelAnimationFrame(raf);
        }
      }
      requestAnimationFrame(tick);
    }

    /* ---- EXIT: Vortex explosion + giant D + flash → navigate ---- */
    function playExit(href) {
      var startTime = null;
      var dur = 900;
      var angle = 0;
      var done = false;
      var raf;

      pxD.style.transition = 'none';
      pxD.style.opacity = '0';
      pxD.style.transform = 'translate(-50%,-50%) scale(0) rotate(-180deg)';
      pxFlash.style.opacity = '0';

      function tick(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / dur, 1);
        angle += 0.07;

        ctx.clearRect(0, 0, W, H);

        /* Darkening BG */
        ctx.fillStyle = 'rgba(2,4,8,' + Math.min(p * 2, 1) + ')';
        ctx.fillRect(0, 0, W, H);

        /* Vortex spiral arms */
        var maxR = Math.sqrt(W * W + H * H);
        var armColors = [
          'rgba(96,165,250,', 'rgba(255,95,162,',
          'rgba(62,230,176,', 'rgba(47,124,246,',
          'rgba(139,92,246,', 'rgba(62,230,176,'
        ];
        for (var arm = 0; arm < 6; arm++) {
          var baseAngle = (arm / 6) * Math.PI * 2 + angle;
          for (var j = 0; j < 70; j++) {
            var t = j / 70;
            var sr = t * maxR * Math.min(p * 1.2, 1) * 0.85;
            var sa = baseAngle + t * Math.PI * 5;
            var px = W / 2 + Math.cos(sa) * sr;
            var py = H / 2 + Math.sin(sa) * sr;
            var pa = (1 - t) * 0.5 * Math.min(p * 2, 1);
            ctx.beginPath();
            ctx.arc(px, py, (1 - t) * 4.5 * p, 0, Math.PI * 2);
            ctx.fillStyle = armColors[arm % armColors.length] + pa + ')';
            ctx.fill();
          }
        }

        /* Contracting energy rings */
        for (var ri = 0; ri < 6; ri++) {
          var rr = maxR * (1 - p * 0.9) * ((6 - ri) / 6) * 0.8;
          if (rr < 0) rr = 0;
          var ra = Math.min(p * 3, 1) * (ri / 6) * 0.9;
          ctx.beginPath();
          ctx.arc(W / 2, H / 2, rr, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,95,162,' + ra + ')';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        /* Shockwave rings bursting out */
        for (var si = 0; si < 3; si++) {
          var sp = Math.max(0, p - si * 0.15);
          var sw = maxR * sp * 0.9;
          var sa2 = Math.max(0, 0.7 - sp);
          ctx.beginPath();
          ctx.arc(W / 2, H / 2, sw, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(62,230,176,' + sa2 + ')';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        /* Giant D rises and spins into view */
        if (p > 0.28) {
          var dp = Math.min((p - 0.28) / 0.42, 1);
          var dEase = 1 - Math.pow(1 - dp, 2);
          var dRot = (1 - dEase) * -200;
          pxD.style.opacity = dEase.toString();
          pxD.style.transform = 'translate(-50%,-50%) scale(' + (dEase * 1.15 + 0.05) + ') rotate(' + dRot + 'deg)';
        }

        if (p < 0.92) {
          raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
          /* Gradient flash → navigate */
          pxFlash.style.transition = 'opacity 0.18s ease';
          pxFlash.style.opacity = '1';
          if (!done) {
            done = true;
            setTimeout(function () { window.location.href = href; }, 180);
          }
        }
      }
      requestAnimationFrame(tick);
    }

    /* ---- Intercept internal nav links ---- */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href) return;
      if (a.target === '_blank') return;
      if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') ||
          href.startsWith('mailto') || href.startsWith('tel')) return;
      if (!href.match(/\.html$|^\/$|^index/)) return;
      e.preventDefault();
      playExit(href);
    }, true);

    /* ---- Play entry on every page load ---- */
    playEntry();
  }

})();

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
            btn.textContent = '← Original Photo';
          } else {
            img.src = btn.getAttribute('data-primary');
            img.alt = btn.getAttribute('data-primary-alt') || '';
            btn.setAttribute('data-state', 'primary');
            btn.textContent = '✨ Spirit Animal';
          }
          img.style.opacity = '1';
        }, 300);
      });
    });
  }

  /* ══════════════════════════
     THREE.JS PARTICLE D
  ══════════════════════════ */
  function initThreeJS() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    if (typeof THREE === 'undefined') {
      setTimeout(initThreeJS, 800);
      return;
    }

    var W = canvas.offsetWidth || window.innerWidth;
    var H = canvas.offsetHeight || window.innerHeight;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 16;

    var isMobile = window.innerWidth < 768;
    var particleCount = isMobile ? 800 : 1600;

    /* Draw D on 2D canvas to get pixel map */
    var c2 = document.createElement('canvas');
    c2.width = 200; c2.height = 200;
    var ctx2 = c2.getContext('2d');
    ctx2.fillStyle = '#000';
    ctx2.fillRect(0, 0, 200, 200);
    ctx2.fillStyle = '#fff';
    ctx2.font = 'bold 200px Arial Black, sans-serif';
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.fillText('D', 100, 105);

    var imgData = ctx2.getImageData(0, 0, 200, 200).data;
    var valid = [];
    for (var y = 0; y < 200; y++) {
      for (var x = 0; x < 200; x++) {
        if (imgData[(y * 200 + x) * 4] > 100) valid.push([x, y]);
      }
    }

    var dPos = [];
    var scatterPos = [];
    for (var i = 0; i < particleCount; i++) {
      var p = valid[Math.floor(Math.random() * valid.length)];
      dPos.push((p[0] / 200 - 0.5) * 18, -(p[1] / 200 - 0.5) * 18, (Math.random() - 0.5) * 2);
      scatterPos.push((Math.random() - 0.5) * 36, (Math.random() - 0.5) * 36, (Math.random() - 0.5) * 18);
    }

    var geo = new THREE.BufferGeometry();
    /* We'll linearly interpolate in JS each frame */
    var currentPos = scatterPos.slice(); /* Start scattered */
    geo.setAttribute('position', new THREE.Float32BufferAttribute(currentPos, 3));

    var mat = new THREE.PointsMaterial({
      size: isMobile ? 0.12 : 0.09,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
      color: new THREE.Color(0x6366f1)
    });

    var pts = new THREE.Points(geo, mat);
    scene.add(pts);

    var clock = new THREE.Clock();
    var mouseX = 0, mouseY = 0;
    var morphT = 0;
    var direction = 1;
    var holdFrames = 0;
    var holding = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5);
      mouseY = -(e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    function easeInOut(t) { return t * t * (3 - 2 * t); }

    (function animate() {
      requestAnimationFrame(animate);
      var time = clock.getElapsedTime();
      var posAttr = geo.getAttribute('position');
      var arr = posAttr.array;
      var ease = easeInOut(Math.max(0, Math.min(1, morphT)));

      for (var k = 0; k < particleCount; k++) {
        var b = k * 3;
        arr[b]   = scatterPos[b]   + (dPos[b]   - scatterPos[b])   * ease;
        arr[b+1] = scatterPos[b+1] + (dPos[b+1] - scatterPos[b+1]) * ease;
        arr[b+2] = scatterPos[b+2] + (dPos[b+2] - scatterPos[b+2]) * ease;
      }
      posAttr.needsUpdate = true;

      /* Morph logic */
      if (!holding) {
        morphT += 0.006 * direction;
        if (morphT >= 1) {
          morphT = 1; holding = true; holdFrames = 0;
        } else if (morphT <= 0) {
          morphT = 0; holding = true; holdFrames = 0; direction *= -1;
        }
      } else {
        holdFrames++;
        if (holdFrames > 180) {
          holding = false;
          direction *= -1;
        }
      }

      /* Rotation + parallax */
      pts.rotation.y = time * 0.03 + mouseX * 0.12;
      pts.rotation.x = mouseY * 0.07;

      /* Slow color pulse */
      var h = 0.67 + Math.sin(time * 0.2) * 0.06;
      mat.color.setHSL(h, 0.85, 0.62);

      renderer.render(scene, camera);
    })();

    window.addEventListener('resize', function () {
      var w = window.innerWidth;
      var h = canvas.offsetHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
      'font-family:"Syne",sans-serif;font-weight:800;font-size:55vw;line-height:0.9;',
      'background:linear-gradient(135deg,#60a5fa,#a78bfa,#22d3ee);',
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;',
      'opacity:0;will-change:transform,opacity;user-select:none}',
      '#px-flash{position:absolute;inset:0;background:linear-gradient(135deg,#020408 0%,#2563eb 40%,#7c3aed 70%,#06b6d4 100%);opacity:0}'
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
        var colors = ['#2563eb', '#7c3aed', '#06b6d4', '#6366f1', '#a78bfa', '#22d3ee'];
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
          'rgba(96,165,250,', 'rgba(167,139,250,',
          'rgba(34,211,238,', 'rgba(99,102,241,',
          'rgba(139,92,246,', 'rgba(6,182,212,'
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
          ctx.strokeStyle = 'rgba(124,58,237,' + ra + ')';
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
          ctx.strokeStyle = 'rgba(34,211,238,' + sa2 + ')';
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

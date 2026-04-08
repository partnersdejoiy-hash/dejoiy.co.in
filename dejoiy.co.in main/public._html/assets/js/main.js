/* ================================================
   DEJOIY — Main JS v3.0
   BPO + Marketplace | YOU + JOY = DEJOIY
================================================ */
;(function () {
  'use strict';

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

})();

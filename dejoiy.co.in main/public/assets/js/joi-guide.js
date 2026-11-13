/* ================================================
   Joi guide — the 3D DEJOIY mascot in the corner.
   She greets you, comments on the section you're reading,
   suggests where to go next, and opens the real Joi chat.
================================================ */
;(function () {
  'use strict';

  var JOI_URL = 'https://joi-ai.dejoiy.com';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = document.body.getAttribute('data-page') || 'home';
  var ASSETS = window.JOI_ASSETS || '/assets/joi/';   // where joi.glb and joi-192.webp live

  // What Joi says, per page and per section (data-joi="…" on each section)
  var SCRIPT = {
    home: {
      hero: ["Hi, I'm Joi! I'll show you around DEJOIY. Go on, drag the big jelly.", [['Take the tour', '#worlds']]],
      formula: ["YOU + JOY = DEJOIY. That's literally where our name comes from."],
      worlds: ["Five worlds to explore. Tap any card to jump straight in.", [['Shop dejoiy.com', 'https://www.dejoiy.com'], ['Try Dmail', 'https://mail.dejoiy.com']]],
      bpo: ["Need a support team? We run them around the clock.", [['See all services', '/services']]],
      reach: ["We work with clients in five countries. Yours could be next.", [['Ask for your country', '/contact']]],
      cta: ["Ready? One message is all it takes.", [['Say hi', '/contact']]]
    },
    about: {
      hero: ["This is our story. Scroll and I'll point out the good bits."],
      mission: ["Mission is what we do now. Vision is where we're heading."],
      story: ["Big-company tools for every business. That's the whole idea."],
      timeline: ["From a 2024 idea to a registered company in 2026. Not bad, right?"],
      values: ["These six values decide how we work, every single day."],
      cta: ["Want to meet the people behind all this?", [['Meet the team', '/team']]]
    },
    services: {
      hero: ["Two flavours here: people and software. Pick one!", [['BPO teams', '#bpo'], ['Technology', '#tech']]],
      bpo: ["Every card is a team we can set up for you."],
      tech: ["Each of these opens the real product. Dmail is my favourite.", [['Open Dmail', 'https://mail.dejoiy.com']]],
      process: ["Four steps. No drama, I promise."],
      cta: ["Tell us what you need and get a quote.", [['Get a quote', '/contact']]]
    },
    team: {
      hero: ["Meet my humans! They built me, so be nice."],
      founder: ["Psst, tap the Spirit animal button."],
      people: ["Eight more amazing people make DEJOIY run."],
      cta: ["Want to work with them?", [['See careers', 'https://careers.dejoiy.com']]]
    },
    contact: {
      hero: ["A real human replies within one working day. I checked."],
      form: ["Not sure what to choose? Pick Something else, that's fine.", [['Email instead', 'mailto:connect@dejoiy.com']]]
    },
    terms: {
      hero: ["Terms, but in plain words. I read them so you don't have to stress."],
      doc: ["Jump around with the list on the left. Section 14 is how to complain.", [['Privacy policy', '/privacy'], ['All apps', '/legal']]]
    },
    privacy: {
      hero: ["Your data, your rules. Here's exactly what we do with it."],
      doc: ["Want your data changed or deleted? Section 6 tells you how.", [['Email us', 'mailto:connect@dejoiy.com']]]
    },
    legal: {
      hero: ["Every DEJOIY app, one place for the fine print."],
      apps: ["Tap an app to see the extra rules for it. Marketplace has its own.", [['Terms', '/terms'], ['Privacy', '/privacy']]]
    },
    '404': {
      '404': ["Oops, this page went missing. Let me take you somewhere better.", [['Go home', '/'], ['Contact us', '/contact']]]
    }
  };
  if (window.JOI_LINES) SCRIPT = window.JOI_LINES;   // another site can bring its own script
  var lines = SCRIPT[page] || SCRIPT.home || {};

  /* ── DOM ── */
  var root = document.createElement('div');
  root.className = 'joi';
  root.innerHTML =
    '<div class="joi-bubble" id="joiBubble" role="status" aria-live="polite" hidden>' +
      '<button class="joi-x" type="button" aria-label="Hide Joi\'s tips">×</button>' +
      '<p class="joi-text"></p>' +
      '<div class="joi-chips"></div>' +
      '<button class="joi-ask" type="button">Ask Joi anything</button>' +
    '</div>' +
    '<button class="joi-me" type="button" aria-label="Joi, your DEJOIY guide. Show tips">' +
      '<img src="' + ASSETS + 'joi-192.webp" alt="" width="96" height="96" />' +
      '<canvas aria-hidden="true"></canvas>' +
    '</button>' +
    '<div class="joi-chat" id="joiChat" role="dialog" aria-label="Chat with Joi" hidden>' +
      '<div class="joi-chat-bar"><b>Joi</b><span>DEJOIY assistant</span>' +
        '<a href="' + JOI_URL + '" target="_blank" rel="noopener" class="joi-open">Open full</a>' +
        '<button type="button" class="joi-chat-x" aria-label="Close chat">×</button></div>' +
    '</div>';
  document.body.appendChild(root);

  var bubble = root.querySelector('.joi-bubble');
  var textEl = root.querySelector('.joi-text');
  var chipsEl = root.querySelector('.joi-chips');
  var me = root.querySelector('.joi-me');
  var chat = root.querySelector('.joi-chat');
  var muted = false;
  try { muted = sessionStorage.getItem('joi-muted') === '1'; } catch (e) {}

  /* ── Speaking ── */
  var typing = null, current = null, spoken = 0, autoHide = null, tapped = false;
  var small = window.matchMedia('(max-width: 640px)');
  function say(key) {
    var line = lines[key];
    if (!line || key === current) return;
    current = key;
    hop();
    // On phones the page comes first: Joi waits with a dot until she's tapped
    if (muted || (small.matches && bubble.hidden && !tapped)) { me.classList.add('has-news'); spoken++; return; }
    spoken++;
    clearTimeout(autoHide);
    if (small.matches) autoHide = setTimeout(function () { bubble.hidden = true; }, 6000);
    bubble.hidden = false;
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    chipsEl.innerHTML = '';
    (line[1] || []).forEach(function (c) {
      var a = document.createElement('a');
      a.className = 'joi-chip'; a.href = c[1]; a.textContent = c[0] + ' →';
      if (/^https?:/.test(c[1])) { a.target = '_blank'; a.rel = 'noopener'; }
      chipsEl.appendChild(a);
    });
    clearInterval(typing);
    if (reduce) { textEl.textContent = line[0]; return; }
    var i = 0, full = line[0];
    textEl.textContent = '';
    typing = setInterval(function () {
      i += 2; textEl.textContent = full.slice(0, i);
      if (i >= full.length) clearInterval(typing);
    }, 22);
  }

  root.querySelector('.joi-x').addEventListener('click', function () {
    bubble.hidden = true; muted = true;
    try { sessionStorage.setItem('joi-muted', '1'); } catch (e) {}
  });
  me.addEventListener('click', function () {
    spin();
    me.classList.remove('has-news');
    if (bubble.hidden) {
      muted = false;
      try { sessionStorage.removeItem('joi-muted'); } catch (e) {}
      tapped = true;
      var k = current; current = null; spoken = 0; say(k || Object.keys(lines)[0]);
    } else {
      bubble.hidden = true;
    }
  });

  /* ── Real Joi chat in a panel ── */
  var iframeLoaded = false;
  function openChat() {
    if (!iframeLoaded) {
      var f = document.createElement('iframe');
      f.src = JOI_URL + '/?embed=1&site=' + encodeURIComponent(location.origin);
      f.title = 'Joi, DEJOIY assistant';
      f.allow = 'microphone';
      chat.appendChild(f);
      iframeLoaded = true;
    }
    chat.hidden = false; bubble.hidden = true;
    root.classList.add('chatting');
    chat.querySelector('.joi-chat-x').focus();
  }
  function closeChat() { chat.hidden = true; root.classList.remove('chatting'); me.focus(); }
  root.querySelector('.joi-ask').addEventListener('click', openChat);
  root.querySelector('.joi-chat-x').addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chat.hidden) closeChat(); });

  /* ── Follow the reader: speak when a section reaches the middle ── */
  var firstVisit = true;
  try { firstVisit = sessionStorage.getItem('dj-intro-done') !== '1'; sessionStorage.setItem('dj-intro-done', '1'); } catch (e) {}
  var io = null;
  function watch() {
    if (io) io.disconnect();
    var first = document.querySelector('[data-joi]');
    say(first ? first.getAttribute('data-joi') : 'hero');
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) say(en.target.getAttribute('data-joi')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('[data-joi]').forEach(function (s) { io.observe(s); });
  }
  // For single-page apps: window.joiGuide.setPage('services') after a route change
  window.joiGuide = {
    setPage: function (name) {
      page = name; lines = SCRIPT[name] || SCRIPT.home || {}; current = null; spoken = 0;
      setTimeout(watch, 400);
    }
  };
  setTimeout(function () { root.classList.add('in'); watch(); }, firstVisit && !reduce ? 3400 : 700);

  /* ── 3D Joi ── */
  var hopT = -10, spinT = -10;
  function hop() { hopT = performance.now() / 1000; }
  function spin() { spinT = performance.now() / 1000; hop(); }

  if (typeof THREE === 'undefined' || !THREE.GLTFLoader) return; // image fallback stays
  var canvas = me.querySelector('canvas');
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.15, 5.2);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffe9d6, 1.15));
  var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(2, 3, 4); scene.add(key);
  var fill = new THREE.DirectionalLight(0xd4ff3a, 0.35); fill.position.set(-3, -1, 2); scene.add(fill);

  var pivot = new THREE.Group(); scene.add(pivot);
  var size = 0;
  function resize() {
    var s = me.clientWidth;
    if (s === size) return;
    size = s; renderer.setSize(s, s, false);
  }

  var gl = new THREE.GLTFLoader();
  if (window.MeshoptDecoder) gl.setMeshoptDecoder(window.MeshoptDecoder);
  gl.load(ASSETS + 'joi.glb', function (gltf) {
    var model = gltf.scene;
    var box = new THREE.Box3().setFromObject(model);
    var dim = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    var s = 2.3 / Math.max(dim.x, dim.y, dim.z);
    var holder = new THREE.Group();
    holder.add(model); holder.scale.setScalar(s);
    pivot.add(holder);
    root.classList.add('has-3d');
    resize();
    loop();
  }, undefined, function () { /* keep the image */ });

  var mx = 0, my = 0;
  window.addEventListener('pointermove', function (e) {
    var r = me.getBoundingClientRect();
    mx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
    my = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
  }, { passive: true });
  window.addEventListener('resize', resize);

  var running = false, lookY = 0;
  document.addEventListener('visibilitychange', function () { if (!document.hidden) loop(); });
  function loop() { if (!running) { running = true; requestAnimationFrame(frame); } }
  function frame(ms) {
    if (document.hidden) { running = false; return; }
    var t = ms / 1000;
    var idle = reduce ? 0 : 1;
    // look toward the cursor
    lookY += ((mx * 0.6) - lookY) * 0.08;
    pivot.rotation.x += ((my * 0.25) - pivot.rotation.x) * 0.08;
    // idle bob + sway
    var y = Math.sin(t * 2) * 0.06 * idle;
    pivot.rotation.z = Math.sin(t * 1.3) * 0.05 * idle;
    // hop with squash when she talks
    var h = t - hopT;
    if (h < 0.6 && !reduce) {
      var p = h / 0.6;
      y += Math.sin(p * Math.PI) * 0.35;
      var sq = Math.sin(p * Math.PI * 2) * 0.12 * (1 - p);
      pivot.scale.set(1 + sq, 1 - sq, 1 + sq);
    } else {
      var br = 1 + Math.sin(t * 2.6) * 0.015 * idle; // breathing
      pivot.scale.set(br, 1 / br, br);
    }
    // happy spin on click
    var sp = (t - spinT) / 0.8;
    var spinA = (sp < 1 && !reduce) ? (1 - Math.pow(1 - sp, 3)) * Math.PI * 2 : 0;
    pivot.rotation.y = lookY + spinA;
    pivot.position.y = y;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
})();

/* ================================================
   DEJOIY — Main Application Script v2.0
   $1B Brand Identity
================================================ */

(function () {
  "use strict";

  /* ── NAV SCROLL STATE ── */
  const nav = document.querySelector(".nav-wrap");
  if (nav) {
    const handleScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  /* ── MOBILE MENU ── */
  const hamburger = document.getElementById("navHamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      hamburger.setAttribute(
        "aria-expanded",
        mobileMenu.classList.contains("open").toString()
      );
    });
    document.querySelectorAll(".mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── INTERSECTION OBSERVER REVEALS ── */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  }

  /* ── ANIMATED COUNTERS ── */
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute("data-target") || el.textContent);
    const suffix = el.getAttribute("data-suffix") || "";
    const prefix = el.getAttribute("data-prefix") || "";
    const duration = 2000;
    const start = performance.now();

    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(eased * target * 10) / 10;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll("[data-counter]");
  if (counterEls.length) {
    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterEls.forEach((el) => counterObs.observe(el));
  }

  /* ── INNOVATION BAR FILLS ── */
  const barFills = document.querySelectorAll(".innovation-bar-fill");
  if (barFills.length) {
    const barObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            barObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    barFills.forEach((el) => barObs.observe(el));
  }

  /* ── THREE.JS HERO PARTICLE SYSTEM ── */
  function initHeroCanvas() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    /* -- Build "D" shape particle positions -- */
    const dPoints = [];
    const count = 1800;

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      let x, y, z;

      if (i < count * 0.55) {
        // Semicircle arc of D
        const ang = (i / (count * 0.55)) * Math.PI - Math.PI / 2;
        const r = 1.5 + Math.random() * 0.06 - 0.03;
        x = Math.cos(ang) * r + 0.2;
        y = Math.sin(ang) * r;
      } else if (i < count * 0.70) {
        // Left vertical bar of D (top)
        x = -1.5 + Math.random() * 0.06;
        y = ((i - count * 0.55) / (count * 0.15)) * 3 - 1.5;
      } else {
        // Scattered fill particles inside D
        const attempts = 5;
        x = (Math.random() - 0.5) * 3.4;
        y = (Math.random() - 0.5) * 3;
        // basic D shape boundary
        if (x > -1.45) {
          const dist = Math.sqrt((x - 0.2) * (x - 0.2) + y * y);
          if (dist > 1.55 || x < -1.4) {
            x = (Math.random() - 0.3) * 2 - 0.4;
            y = (Math.random() - 0.5) * 3;
          }
        }
      }

      z = (Math.random() - 0.5) * 0.4;
      dPoints.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(dPoints, 3));

    // Random offsets for wave animation
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) offsets[i] = Math.random() * Math.PI * 2;
    geometry.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));

    const material = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: false,
      color: new THREE.Color(0x60a5fa),
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Secondary scattered particles (ambient)
    const ambientCount = 600;
    const ambientPositions = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount; i++) {
      ambientPositions[i * 3] = (Math.random() - 0.5) * 10;
      ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const ambientGeo = new THREE.BufferGeometry();
    ambientGeo.setAttribute("position", new THREE.Float32BufferAttribute(ambientPositions, 3));
    const ambientMat = new THREE.PointsMaterial({
      size: 0.01,
      color: new THREE.Color(0x818cf8),
      transparent: true,
      opacity: 0.3,
      sizeAttenuation: true,
    });
    const ambient = new THREE.Points(ambientGeo, ambientMat);
    scene.add(ambient);

    let mouse = { x: 0, y: 0 };
    let targetRotX = 0, targetRotY = 0;

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotY = mouse.x * 0.2;
      targetRotX = mouse.y * 0.15;
    });

    let frame = 0;

    function animate() {
      requestAnimationFrame(animate);
      frame++;

      // Wave the particles gently
      const pos = geometry.attributes.position.array;
      const off = geometry.attributes.offset.array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        pos[idx + 2] = Math.sin(frame * 0.012 + off[i]) * 0.08;
      }
      geometry.attributes.position.needsUpdate = true;

      // Smooth mouse tracking
      points.rotation.y += (targetRotY - points.rotation.y) * 0.04;
      points.rotation.x += (targetRotX - points.rotation.x) * 0.04;
      ambient.rotation.y += 0.0005;

      // Color pulse
      const hue = (frame * 0.002) % 1;
      material.color.setHSL(0.58 + hue * 0.15, 0.8, 0.65);

      renderer.render(scene, camera);
    }

    animate();

    // Resize
    const resizeObs = new ResizeObserver(() => {
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
    });
    resizeObs.observe(canvas);
  }

  /* ── GSAP SCROLL ANIMATIONS ── */
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Parallax orbs
    document.querySelectorAll(".parallax-orb").forEach((orb, i) => {
      gsap.to(orb, {
        y: -100 * (i % 2 === 0 ? 1 : -1),
        scrollTrigger: {
          trigger: orb.closest("section") || document.body,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    // Vision quote word-by-word
    const visionQuote = document.querySelector(".vision-quote-inner");
    if (visionQuote) {
      const text = visionQuote.textContent;
      const words = text.split(" ");
      visionQuote.innerHTML = words
        .map((w) => `<span class="vword" style="opacity:0.2;display:inline-block;margin-right:0.25em">${w}</span>`)
        .join("");

      gsap.to(".vword", {
        opacity: 1,
        stagger: 0.05,
        duration: 0.5,
        scrollTrigger: {
          trigger: visionQuote,
          start: "top 80%",
          end: "bottom 40%",
          scrub: true,
        },
      });
    }
  }

  /* ── IMAGE SWAP (team) ── */
  document.querySelectorAll("[data-swap-image]").forEach((card) => {
    card.addEventListener("click", function () {
      const img = card.querySelector("img");
      const primary = card.getAttribute("data-primary");
      const alternate = card.getAttribute("data-alternate");
      const state = card.getAttribute("data-state") || "primary";
      if (!img || !primary || !alternate) return;

      img.style.opacity = "0";
      img.style.transition = "opacity 0.3s ease";

      setTimeout(() => {
        if (state === "primary") {
          img.src = alternate;
          img.alt = card.getAttribute("data-alternate-alt") || "";
          card.setAttribute("data-state", "alternate");
        } else {
          img.src = primary;
          img.alt = card.getAttribute("data-primary-alt") || "";
          card.setAttribute("data-state", "primary");
        }
        img.style.opacity = "1";
      }, 300);
    });
  });

  /* ── MAP NODES STAGGER ── */
  document.querySelectorAll(".map-node").forEach((node, i) => {
    node.style.animationDelay = `${(i * 0.4) % 3}s`;
  });

  /* ── INIT ── */
  document.addEventListener("DOMContentLoaded", () => {
    initHeroCanvas();
    initGSAP();
  });

  // Also try after load for Three.js
  window.addEventListener("load", () => {
    initHeroCanvas();
  });

})();

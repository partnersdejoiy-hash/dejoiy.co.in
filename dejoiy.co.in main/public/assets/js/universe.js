/*
  DEJOIY cosmos for dejoiy.co.in — a copy of lib/cosmos/engine.js and
  lib/cosmos/shaders.js from the business.dejoiy.com repository, wrapped for a
  static page (global THREE from the CDN). Keep the two in step.
  Sections steer the camera with data-station="core|signal|wide|drift".
*/
(function () {
  "use strict";
/* GLSL for the DEJOIY cosmos. */
const NEBULA_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const NEBULA_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform vec2 uAspect;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = (vUv - 0.5) * uAspect;
  float t = uTime * 0.012;
  vec2 drift = vec2(t, -t * 0.6) + vec2(0.0, uScroll * 0.9);
  float q = fbm(uv * 1.6 + drift);
  float r = fbm(uv * 2.4 + q * 1.8 - drift * 1.3);
  float cloud = smoothstep(0.38, 0.95, r);
  vec3 base = vec3(0.027, 0.020, 0.058);
  vec3 magenta = vec3(0.72, 0.12, 0.44);
  vec3 violet = vec3(0.30, 0.16, 0.62);
  vec3 blue = vec3(0.10, 0.24, 0.74);
  float band = smoothstep(-0.9, 0.9, uv.x + uv.y * 0.4 + sin(uScroll * 3.14) * 0.4);
  vec3 tint = mix(magenta, violet, band);
  tint = mix(tint, blue, smoothstep(0.45, 1.0, q + band * 0.35));
  float vignette = smoothstep(1.25, 0.15, length(uv * vec2(0.8, 1.1)));
  vec3 col = base + tint * cloud * 0.28 * vignette;
  col += tint * pow(q, 3.0) * 0.12 * vignette;
  gl_FragColor = vec4(col, 1.0);
}`;

const STAR_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = max(-mv.z, 0.1);
  gl_PointSize = clamp(aSize * uPixelRatio * (70.0 / depth), 0.0, 9.0 * uPixelRatio);
  vColor = aColor;
  vTwinkle = 0.62 + 0.38 * sin(uTime * (0.6 + aPhase * 1.4) + aPhase * 30.0);
  vTwinkle *= smoothstep(0.4, 6.0, depth);
}`;

const STAR_FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float alpha = pow(core, 2.2) * vTwinkle;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, alpha);
}`;

const DISC_VERT = /* glsl */ `
attribute float aRadius;
attribute float aAngle;
attribute float aLift;
attribute float aSize;
uniform float uTime;
uniform float uPixelRatio;
varying float vMix;
varying float vAlpha;
void main() {
  float angle = aAngle + uTime * (0.34 / sqrt(aRadius));
  vec3 p = vec3(cos(angle) * aRadius, aLift, sin(angle) * aRadius);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio * (24.0 / max(-mv.z, 0.1));
  vMix = smoothstep(2.4, 7.0, aRadius);
  vAlpha = smoothstep(7.4, 5.2, aRadius) * smoothstep(2.1, 2.9, aRadius);
}`;

const DISC_FRAG = /* glsl */ `
precision highp float;
varying float vMix;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha * 0.85;
  if (a < 0.01) discard;
  vec3 inner = vec3(1.0, 0.42, 0.78);
  vec3 mid = vec3(0.62, 0.42, 1.0);
  vec3 outer = vec3(0.38, 0.58, 1.0);
  vec3 col = mix(inner, mid, smoothstep(0.0, 0.5, vMix));
  col = mix(col, outer, smoothstep(0.5, 1.0, vMix));
  gl_FragColor = vec4(col, a);
}`;

const CORE_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
void main() {
  vPos = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const CORE_FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
uniform float uTime;
float hash(vec3 p) { return fract(sin(dot(p, vec3(17.1, 113.3, 71.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash(i), n100 = hash(i + vec3(1,0,0)), n010 = hash(i + vec3(0,1,0)), n110 = hash(i + vec3(1,1,0));
  float n001 = hash(i + vec3(0,0,1)), n101 = hash(i + vec3(1,0,1)), n011 = hash(i + vec3(0,1,1)), n111 = hash(i + vec3(1,1,1));
  return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
             mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
}
void main() {
  float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
  vec3 p = vPos * 1.7 + vec3(uTime * 0.05, uTime * 0.03, 0.0);
  float swirl = noise(p) * 0.6 + noise(p * 2.3 - uTime * 0.04) * 0.4;
  vec3 deep = vec3(0.08, 0.03, 0.20);
  vec3 magenta = vec3(0.95, 0.22, 0.62);
  vec3 violet = vec3(0.52, 0.30, 1.0);
  vec3 blue = vec3(0.30, 0.55, 1.0);
  vec3 surface = mix(deep, violet, smoothstep(0.35, 0.8, swirl));
  surface = mix(surface, magenta, smoothstep(0.62, 0.9, swirl) * 0.7);
  vec3 rim = mix(magenta, blue, smoothstep(-0.6, 0.8, vNormal.y));
  vec3 col = surface * 0.75 + rim * fresnel * 1.6;
  gl_FragColor = vec4(col, 1.0);
}`;

const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const GLOW_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uColor;
uniform float uStrength;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(max(1.0 - d, 0.0), 2.6) * uStrength;
  gl_FragColor = vec4(uColor, a);
}`;


const SHADERS = {
  NEBULA_VERT, NEBULA_FRAG, STAR_VERT, STAR_FRAG, DISC_VERT, DISC_FRAG,
  CORE_VERT, CORE_FRAG, GLOW_VERT, GLOW_FRAG,
};

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
    return true;
  } catch (e) {
    return false;
  }
}

/*
  DEJOIY cosmos engine — framework-free, shared by business.dejoiy.com and
  dejoiy.co.in (the static site receives a copy without the `export`).

  One fixed WebGL scene: nebula, a deep starfield and the DEJOIY system
  (a glowing core, a particle disc and three orbits). The camera flies
  between "stations" — any element marked data-station="core|signal|wide|drift"
  — weighted by how close each one is to the middle of the viewport, and
  follows its target on a critically damped spring so the motion has weight.
  `dejoiy:signal` events launch a point of light that spirals in from the
  outer orbit and lands on the core: one customer contact, carried through
  to resolution.
*/

function createCosmos(THREE, host, shaders) {
  const {
    NEBULA_VERT, NEBULA_FRAG, STAR_VERT, STAR_FRAG, DISC_VERT, DISC_FRAG,
    CORE_VERT, CORE_FRAG, GLOW_VERT, GLOW_FRAG,
  } = shaders;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 820px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.75);
  let failed = false;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x07050f, 1);
  if (renderer.debug) renderer.debug.onShaderError = () => { failed = true; };
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  scene.add(camera);
  const disposables = [];
  const track = (item) => { disposables.push(item); return item; };

  /* Nebula — locked to the camera so it reads as infinitely far away. */
  const nebulaUniforms = { uTime: { value: 0 }, uScroll: { value: 0 }, uAspect: { value: new THREE.Vector2(1, 1) } };
  const nebula = new THREE.Mesh(
    track(new THREE.PlaneGeometry(1, 1)),
    track(new THREE.ShaderMaterial({ vertexShader: NEBULA_VERT, fragmentShader: NEBULA_FRAG, uniforms: nebulaUniforms, depthWrite: false })),
  );
  nebula.position.z = -260;
  nebula.renderOrder = -1;
  camera.add(nebula);

  /* Starfield in a deep slab so camera flights produce real parallax. */
  const starCount = small ? 3200 : 8000;
  const starPos = new Float32Array(starCount * 3);
  const starSize = new Float32Array(starCount);
  const starPhase = new Float32Array(starCount);
  const starColor = new Float32Array(starCount * 3);
  const palette = [[1, 1, 1], [1, 0.82, 0.92], [0.8, 0.86, 1], [1, 0.95, 0.86]];
  for (let i = 0; i < starCount; i++) {
    const r = 18 + Math.pow(Math.random(), 0.7) * 150;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    starPos[i * 3 + 2] = r * Math.cos(ph);
    starSize[i] = Math.random() < 0.05 ? 2.4 + Math.random() * 2.2 : 0.6 + Math.random() * 1.3;
    starPhase[i] = Math.random();
    starColor.set(palette[(Math.random() * palette.length) | 0], i * 3);
  }
  const starGeo = track(new THREE.BufferGeometry());
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("aSize", new THREE.BufferAttribute(starSize, 1));
  starGeo.setAttribute("aPhase", new THREE.BufferAttribute(starPhase, 1));
  starGeo.setAttribute("aColor", new THREE.BufferAttribute(starColor, 3));
  const starUniforms = { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } };
  const stars = new THREE.Points(starGeo, track(new THREE.ShaderMaterial({
    vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, uniforms: starUniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })));
  scene.add(stars);

  /* The DEJOIY system */
  const system = new THREE.Group();
  scene.add(system);
  const tilt = new THREE.Group();
  tilt.rotation.set(0.5, 0, -0.16);
  system.add(tilt);

  const coreUniforms = { uTime: { value: 0 } };
  const core = new THREE.Mesh(
    track(new THREE.SphereGeometry(1.25, small ? 48 : 80, small ? 48 : 80)),
    track(new THREE.ShaderMaterial({ vertexShader: CORE_VERT, fragmentShader: CORE_FRAG, uniforms: coreUniforms })),
  );
  tilt.add(core);

  const makeGlow = (color, strength, size) => {
    const mesh = new THREE.Mesh(
      track(new THREE.PlaneGeometry(1, 1)),
      track(new THREE.ShaderMaterial({
        vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG,
        uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      })),
    );
    mesh.scale.setScalar(size);
    return mesh;
  };
  const coreGlow = makeGlow(0xd0408f, 0.62, 9);
  const coreHot = makeGlow(0xff6fb5, 0.5, 4.4);
  tilt.add(coreGlow, coreHot);

  const discCount = small ? 5000 : 12000;
  const dRadius = new Float32Array(discCount);
  const dAngle = new Float32Array(discCount);
  const dLift = new Float32Array(discCount);
  const dSize = new Float32Array(discCount);
  for (let i = 0; i < discCount; i++) {
    const r = 2.3 + Math.pow(Math.random(), 1.6) * 5.4;
    dRadius[i] = r;
    dAngle[i] = Math.random() * Math.PI * 2;
    dLift[i] = (Math.random() - 0.5) * 0.16 * (r / 4);
    dSize[i] = 0.6 + Math.random() * 1.6;
  }
  const discGeo = track(new THREE.BufferGeometry());
  discGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(discCount * 3), 3));
  discGeo.setAttribute("aRadius", new THREE.BufferAttribute(dRadius, 1));
  discGeo.setAttribute("aAngle", new THREE.BufferAttribute(dAngle, 1));
  discGeo.setAttribute("aLift", new THREE.BufferAttribute(dLift, 1));
  discGeo.setAttribute("aSize", new THREE.BufferAttribute(dSize, 1));
  discGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8.5);
  const discUniforms = { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } };
  const disc = new THREE.Points(discGeo, track(new THREE.ShaderMaterial({
    vertexShader: DISC_VERT, fragmentShader: DISC_FRAG, uniforms: discUniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })));
  disc.rotation.x = -0.08;
  tilt.add(disc);

  const orbitDefs = [
    { radius: 3.2, tilt: [1.42, 0.16, 0.42], speed: 0.3, color: 0xff7ac0 },
    { radius: 4.6, tilt: [1.62, -0.22, -0.36], speed: 0.19, color: 0xc9b8ff },
    { radius: 6.2, tilt: [1.3, 0.34, 0.12], speed: 0.12, color: 0x8fb2ff },
  ];
  const orbits = orbitDefs.map((def, index) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
    const points = new THREE.EllipseCurve(0, 0, def.radius, def.radius).getPoints(200).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const ring = new THREE.LineLoop(
      track(new THREE.BufferGeometry().setFromPoints(points)),
      track(new THREE.LineBasicMaterial({ color: def.color, transparent: true, opacity: 0.2, depthWrite: false })),
    );
    pivot.add(ring);
    const satellite = new THREE.Mesh(track(new THREE.SphereGeometry(0.1, 16, 16)), track(new THREE.MeshBasicMaterial({ color: 0xffffff })));
    const halo = makeGlow(def.color, 0.95, 1.2);
    satellite.add(halo);
    pivot.add(satellite);
    tilt.add(pivot);
    return { pivot, satellite, halo, def, phase: index * 2.1 };
  });

  /* Signals: one customer contact, spiralling in to resolution. */
  const signals = [];
  const signalColors = { voice: 0xff7ac0, chat: 0xffffff, email: 0x8fb2ff };
  let coreFlash = 0;
  const launch = (channel) => {
    const head = makeGlow(signalColors[channel] || 0xffffff, 1.2, 1.4);
    const dot = new THREE.Mesh(track(new THREE.SphereGeometry(0.08, 12, 12)), track(new THREE.MeshBasicMaterial({ color: 0xffffff })));
    dot.add(head);
    tilt.add(dot);
    const trailCount = 40;
    const trailGeo = track(new THREE.BufferGeometry());
    trailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(trailCount * 3), 3));
    const trail = new THREE.Line(trailGeo, track(new THREE.LineBasicMaterial({ color: signalColors[channel] || 0xffffff, transparent: true, opacity: 0.55 })));
    trail.frustumCulled = false;
    tilt.add(trail);
    signals.push({ dot, head, trail, trailCount, age: 0, life: reduced ? 0.01 : 5.6, start: Math.random() * Math.PI * 2, history: [] });
  };
  const onSignal = (e) => launch(e.detail && e.detail.channel);
  window.addEventListener("dejoiy:signal", onSignal);

  /* Camera stations (camera position, look-at point). */
  const POSES = {
    core: small
      ? { pos: [-0.6, -5.4, 17], look: [-0.6, -5.4, 0] }
      : { pos: [-5, -2.2, 12.5], look: [-5, -2.2, 0] },
    signal: small
      ? { pos: [0, 6.5, 13], look: [0, -2.2, 0] }
      : { pos: [-4.2, 4.2, 10.5], look: [-4.2, -0.6, 0] },
    wide: small
      ? { pos: [2, 10, 34], look: [0, 3, 0] }
      : { pos: [-9, 6, 30], look: [-4, 1, 0] },
    drift: small
      ? { pos: [8, -14, -40], look: [12, -18, -120] }
      : { pos: [14, -10, -46], look: [20, -14, -130] },
  };
  const target = { pos: new THREE.Vector3(...POSES.core.pos), look: new THREE.Vector3(...POSES.core.look) };
  const cur = { pos: target.pos.clone(), look: target.look.clone(), vp: new THREE.Vector3(), vl: new THREE.Vector3() };
  let stationEls = [];
  const collectStations = () => { stationEls = Array.from(document.querySelectorAll("[data-station]")); };
  collectStations();
  const mo = new MutationObserver(collectStations);
  mo.observe(document.body, { childList: true, subtree: true });

  const tmpP = new THREE.Vector3();
  const tmpL = new THREE.Vector3();
  const readStations = () => {
    const vh = window.innerHeight;
    let total = 0;
    tmpP.set(0, 0, 0);
    tmpL.set(0, 0, 0);
    for (const el of stationEls) {
      const pose = POSES[el.getAttribute("data-station")];
      if (!pose) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const center = r.top + Math.min(r.height, vh) / 2;
      const d = Math.abs(center - vh / 2) / (vh * 0.85);
      const w = Math.max(0, 1 - d);
      const ww = w * w * (3 - 2 * w);
      if (ww <= 0) continue;
      total += ww;
      tmpP.x += pose.pos[0] * ww; tmpP.y += pose.pos[1] * ww; tmpP.z += pose.pos[2] * ww;
      tmpL.x += pose.look[0] * ww; tmpL.y += pose.look[1] * ww; tmpL.z += pose.look[2] * ww;
    }
    if (total > 0) {
      target.pos.copy(tmpP.multiplyScalar(1 / total));
      target.look.copy(tmpL.multiplyScalar(1 / total));
    }
  };

  const state = { w: 1, h: 1, px: 0, py: 0, tx: 0, ty: 0, scroll: 0 };
  const resize = () => {
    state.w = host.clientWidth || window.innerWidth;
    state.h = host.clientHeight || window.innerHeight;
    renderer.setSize(state.w, state.h, false);
    camera.aspect = state.w / state.h;
    camera.updateProjectionMatrix();
    const planeH = 2 * 260 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    nebula.scale.set(planeH * camera.aspect * 1.1, planeH * 1.1, 1);
    nebulaUniforms.uAspect.value.set(camera.aspect, 1);
    if (reduced) safeRender(0);
  };
  const onPointer = (e) => {
    state.tx = (e.clientX / state.w - 0.5) * 2;
    state.ty = (e.clientY / state.h - 0.5) * 2;
  };

  const parentQuat = new THREE.Quaternion();
  const face = (mesh) => {
    mesh.parent.getWorldQuaternion(parentQuat);
    mesh.quaternion.copy(parentQuat.invert().multiply(camera.quaternion));
  };

  let elapsed = 0;
  let revealed = false;
  const K = 9; // spring stiffness
  const C = 2 * Math.sqrt(K); // critical damping
  function renderFrame(dt) {
    elapsed += dt;
    const t = elapsed;
    starUniforms.uTime.value = t;
    discUniforms.uTime.value = t;
    coreUniforms.uTime.value = t;
    nebulaUniforms.uTime.value = t;

    readStations();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    state.scroll = max > 0 ? window.scrollY / max : 0;
    nebulaUniforms.uScroll.value += (state.scroll - nebulaUniforms.uScroll.value) * Math.min(dt * 2, 1);

    if (reduced || dt === 0) {
      cur.pos.copy(target.pos);
      cur.look.copy(target.look);
    } else {
      /* critically damped spring toward the target pose, in fixed sub-steps */
      let remaining = dt;
      while (remaining > 0) {
        const step = Math.min(remaining, 1 / 120);
        remaining -= step;
        cur.vp.addScaledVector(tmpP.copy(target.pos).sub(cur.pos), K * step).multiplyScalar(1 - C * step);
        cur.vl.addScaledVector(tmpL.copy(target.look).sub(cur.look), K * step).multiplyScalar(1 - C * step);
        cur.pos.addScaledVector(cur.vp, step);
        cur.look.addScaledVector(cur.vl, step);
      }
    }

    const pe = reduced ? 0 : Math.min(dt * 2.2, 1);
    state.px += (state.tx - state.px) * pe;
    state.py += (state.ty - state.py) * pe;
    camera.position.set(
      cur.pos.x + state.px * 0.9 + Math.sin(t * 0.11) * 0.25,
      cur.pos.y - state.py * 0.6 + Math.cos(t * 0.09) * 0.2,
      cur.pos.z,
    );
    camera.lookAt(cur.look.x + state.px * 0.3, cur.look.y - state.py * 0.2, cur.look.z);
    camera.updateMatrixWorld();

    system.rotation.y = t * 0.03;
    stars.rotation.y = t * 0.003;
    orbits.forEach((o) => {
      const a = o.phase + t * o.def.speed;
      o.satellite.position.set(Math.cos(a) * o.def.radius, Math.sin(a) * o.def.radius, 0);
    });

    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      s.age += dt || s.life;
      const k = Math.min(s.age / s.life, 1);
      const e = 1 - Math.pow(1 - k, 2.4);
      const radius = 7.2 * (1 - e) + 1.25 * e;
      const angle = s.start + e * Math.PI * 3.2;
      s.dot.position.set(Math.cos(angle) * radius, Math.sin(k * Math.PI) * 0.9 - 0.1, Math.sin(angle) * radius);
      s.history.unshift(s.dot.position.clone());
      if (s.history.length > s.trailCount) s.history.pop();
      const arr = s.trail.geometry.attributes.position.array;
      for (let j = 0; j < s.trailCount; j++) {
        const p = s.history[Math.min(j, s.history.length - 1)];
        arr[j * 3] = p.x; arr[j * 3 + 1] = p.y; arr[j * 3 + 2] = p.z;
      }
      s.trail.geometry.attributes.position.needsUpdate = true;
      if (k >= 1) {
        coreFlash = 1;
        tilt.remove(s.dot, s.trail);
        signals.splice(i, 1);
      }
    }
    coreFlash = Math.max(0, coreFlash - dt * 0.9);
    coreGlow.material.uniforms.uStrength.value = 0.6 + Math.sin(t * 0.8) * 0.06 + coreFlash * 0.9;
    coreHot.scale.setScalar(4.4 + coreFlash * 3.5);

    system.updateMatrixWorld(true);
    face(coreGlow);
    face(coreHot);
    orbits.forEach((o) => face(o.halo));
    signals.forEach((s) => face(s.head));

    renderer.render(scene, camera);
    if (failed) throw new Error("shader");
    if (!revealed) { revealed = true; host.classList.add("is-live"); }
  }
  function safeRender(dt) {
    try { renderFrame(dt); return true; } catch { stop(); host.classList.remove("is-live"); return false; }
  }

  const clock = new THREE.Clock();
  let frame = 0;
  let running = false;
  let sampleStart = 0;
  let frames = 0;
  let checked = false;
  const loop = () => {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!safeRender(dt)) return;
    if (!checked) {
      const now = performance.now();
      if (!sampleStart) sampleStart = now;
      frames++;
      if (now - sampleStart > 2500) {
        checked = true;
        if ((frames * 1000) / (now - sampleStart) < 30 && pixelRatio > 1) {
          pixelRatio = 1;
          renderer.setPixelRatio(1);
          starUniforms.uPixelRatio.value = 1;
          discUniforms.uPixelRatio.value = 1;
          resize();
        }
      }
    }
    frame = requestAnimationFrame(loop);
  };
  function start() {
    if (running || document.hidden) return;
    if (reduced) { safeRender(0); return; }
    running = true;
    clock.getDelta();
    frame = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(frame); }
  const onVisibility = () => (document.hidden ? stop() : start());
  const onScrollReduced = () => safeRender(0);
  const onLost = (e) => { e.preventDefault(); stop(); host.classList.remove("is-live"); };

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  if (!coarse) window.addEventListener("pointermove", onPointer, { passive: true });
  if (reduced) window.addEventListener("scroll", onScrollReduced, { passive: true });
  start();

  return {
    refresh: collectStations,
    dispose() {
      stop();
      mo.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScrollReduced);
      window.removeEventListener("dejoiy:signal", onSignal);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      host.classList.remove("is-live");
    },
  };
}

  function initMotion() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    var items = gsap.utils.toArray("[data-reveal]");
    if (!items.length) return;
    gsap.set(items, { y: 28, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", stagger: 0.075, clearProps: "transform" });
      },
    });
    var name = document.querySelector(".formula-wrap");
    if (name) {
      gsap.fromTo(name, { scale: 0.94 }, { scale: 1, ease: "none", scrollTrigger: { trigger: name, start: "top bottom", end: "center center", scrub: 0.5 } });
    }
    window.addEventListener("load", function () { ScrollTrigger.refresh(); }, { once: true });
  }

  function init() {
    var host = document.getElementById("cosmos");
    if (host && typeof THREE !== "undefined" && hasWebGL() && !(navigator.connection && navigator.connection.saveData)) {
      try { createCosmos(THREE, host, SHADERS); } catch (e) { host.classList.remove("is-live"); }
    }
    initMotion();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

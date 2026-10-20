# DEJOIY — corporate website (dejoiy.co.in)

## Overview
Corporate website for DEJOIY India Private Limited (Founder & CEO: Jyoti Sharma): people, technology and connected commerce. Copy stays factual: no rankings, unverified statistics, certifications or awards.

## Technology Stack
- Pure HTML5, CSS3, and vanilla JavaScript (ES6+)
- Three.js (CDN) — animated "D" particle system in hero
- GSAP + ScrollTrigger (CDN) — scroll animations and parallax
- Syne + Inter fonts (Google Fonts) — premium display typography
- No build system or package manager (static files)

## Pages
- `index.html` — Hero with YOU+JOY formula, BPO section (6 services), Marketplace (10M+ products), world map, animated D element
- `about.html` — Brand story, mission/vision, animated timeline milestones
- `services.html` — BPO & enterprise technology service catalog
- `team.html` — Founder spotlight + ALL 9 team members with photos + 6 culture values
- `contact.html` — Premium contact form with side info panel

## Universe layer (assets/css/universe.css, assets/js/universe.js)
- Shared with business.dejoiy.com: a live Three.js cosmos (nebula, deep starfield, the DEJOIY core, disc and orbits) fixed behind every page; sections steer the camera with `data-station="core|signal|wide|drift"` on a critically damped spring. universe.js is a copy of lib/cosmos/engine.js + shaders.js from the dejoiy-site repo.
- Type: Anton (monument, headings) + Work Sans (text). Flat ground #07050f, ink #f2ede4, one accent (brand magenta #e5338a). Square corners; no glass, gradients or icon cards in the UI.
- Static CSS star sky when WebGL is unavailable; reduced motion renders still frames.

## Base design system (assets/css/styles.css)
- Color system: Deep midnight (#020408) → royal indigo → electric cyan
- Typography: Syne 800 for display, Inter for body
- Components: `.empire-card`, `.badge`, `.btn-primary`, `.btn-ghost`, `.glass`, `.glow-border`
- Animations: `.reveal` (scroll observer), animated counters, marquee, GSAP parallax
- Responsive: Full mobile/tablet breakpoints

## JavaScript (assets/js/main.js)
- Three.js particle system forming "D" shape in hero canvas
- GSAP ScrollTrigger parallax and word-by-word reveal
- IntersectionObserver scroll reveals
- Animated number counters with easing
- Innovation bar fill animations
- Mobile menu, nav scroll state, image swap

## Project Structure
```
dejoiy.co.in main/public._html/
├── index.html         # Homepage ($1B hero, ecosystem, world map, vision)
├── about.html         # Brand story + timeline
├── services.html      # Enterprise technology services
├── team.html          # Leadership + culture values
├── contact.html       # Contact form + info
├── assets/
│   ├── css/styles.css # Complete design system
│   ├── js/main.js     # Three.js + GSAP + interactions
│   ├── icons/
│   └── images/
```

## Running Locally
```
python3 -m http.server 5000 --directory 'dejoiy.co.in main/public._html'
```
Workflow: "Start application" on port 5000 (webview)

## Deployment
Configured as **static** deployment with `publicDir` = `dejoiy.co.in main/public._html`

## External Platforms
- Marketplace: https://www.dejoiy.com
- Business Portal: https://business.dejoiy.com

# DEJOIY Global Headquarters — $1B Brand Identity Website

## Overview
Corporate headquarters website for DEJOIY India Private Limited. Fully redesigned as a premium global brand identity — SpaceX-level scrolling structure, Apple-level design quality, cinematic typography, and enterprise technology positioning.

## Technology Stack
- Pure HTML5, CSS3, and vanilla JavaScript (ES6+)
- Three.js (CDN) — animated "D" particle system in hero
- GSAP + ScrollTrigger (CDN) — scroll animations and parallax
- Syne + Inter fonts (Google Fonts) — premium display typography
- No build system or package manager (static files)

## Pages
- `index.html` — $1B homepage with Three.js particle hero, animated stats, empire cards, world map, vision section
- `about.html` — Brand story, mission/vision, timeline milestones
- `services.html` — Full enterprise technology service catalog
- `team.html` — Leadership philosophy, cultural values, founder section
- `contact.html` — Premium contact form with side info panel

## Design System (assets/css/styles.css)
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

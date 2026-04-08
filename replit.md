# DEJOIY Corporate HQ Website

## Overview
Corporate headquarters website for DEJOIY India Private Limited. A static HTML/CSS/JS website showcasing the DEJOIY Ecosystem — including its Marketplace and Business Portal.

## Project Structure
```
dejoiy.co.in main/public._html/
├── index.html        # Main landing page
├── contact.html      # Contact page
├── services.html     # Services page
├── team.html         # Team/Leadership page
├── default.php       # Hostinger default page (unused)
├── .htaccess         # Apache config (unused in Replit)
└── assets/
    ├── css/styles.css  # Custom styles (glassmorphism, CSS vars)
    ├── js/main.js      # Scroll animations, mobile menu, image swap
    ├── icons/
    └── images/
```

## Technologies
- Pure HTML5, CSS3, and vanilla JavaScript (ES6+)
- Tailwind CSS via CDN
- Google Fonts (Inter, Poppins, Montserrat, DM Sans)
- No build system or package manager

## Running the App
The site is served as a static file server using Python's built-in HTTP server:
```
python3 -m http.server 5000 --directory 'dejoiy.co.in main/public._html'
```
Configured as a workflow named "Start application" on port 5000.

## Deployment
Configured as a **static** deployment with `publicDir` set to `dejoiy.co.in main/public._html`.

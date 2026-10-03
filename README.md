# QRCraft — Smart QR Code Generator

> A production-quality, modern full-stack web application for generating, previewing, and downloading custom high-definition QR codes with live watermarks, batch generation, a built-in scanner, SVG export, and 4 atmospheric themes.

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-qr--craft--beta.vercel.app-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white)](https://qr-craft-beta.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-likhithgp2006%2FQR--Craft-181717?style=for-the-badge&logo=github)](https://github.com/likhithgp2006/QR-Craft)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)

### 🌐 [Live Demo → https://qr-craft-beta.vercel.app/](https://qr-craft-beta.vercel.app/)

</div>

---

## 🌟 Overview

**QRCraft** lets users input any URL or text, fully customize the QR code's colors and watermarks, preview it live in real-time, and download it in high-resolution PNG or SVG format.

Engineered with a **Python Flask** backend and a **Vanilla HTML5/CSS3/JavaScript** frontend featuring a dark glassmorphic design system with animated particle backgrounds and 4 switchable atmospheric themes.

---

## ✨ Features

- ⚡ **Instant Live Preview** — QR codes regenerate automatically as you type, with animated reveal transitions.
- 💧 **Watermark Customization** — Add faint background or center-emblem watermarks (text or image) with adjustable opacity. Supports PNG, JPG, SVG, WebP uploads plus preset icons (Star, Heart, Shield, Crown).
- ✍️ **Custom Watermark Text** — Type any text watermark with a custom color picker.
- 🏷️ **Bottom Banner** — Add a colored bottom label with custom text, text color, and banner background color.
- 🎨 **Full Color Customization** — Hex inputs, HTML5 color pickers, curated presets (Classic, Indigo, Emerald, Slate, Ember, Royal, Inverted) and one-click Swap.
- 📐 **Output Resolution Selector** — Choose 512px (Fast), 1024px (Default), or 2048px (HD Print).
- 🔍 **QR Scanner / Decoder** — Upload any QR code image and instantly decode its content.
- 📦 **Batch Generator** — Generate up to 50 QR codes at once and download them all as a ZIP archive.
- 🕓 **QR History** — Last 20 generated QR codes saved locally with quick re-download.
- 🖼️ **SVG Export** — Download crisp, infinitely scalable vector QR codes.
- 📋 **Copy Image & Share** — Copy QR to clipboard or share via the Web Share API.
- 🌌 **4 Atmospheric Themes**:
  - 🌌 **Cosmic Nebula** (Purple / Indigo / Magenta)
  - ⚡ **Cyber Matrix** (Emerald / Cyan / Teal)
  - 🌅 **Sunset Pulse** (Rose / Amber / Coral)
  - 🌑 **Obsidian Dark** (Slate / Ice Blue / Silver)
- 🎇 **Animated Particle Background** — Interactive constellation canvas that reacts to the active theme.
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop at every breakpoint.

---

## 🛠 Technology Stack

### Frontend
- **HTML5** — Semantic, accessible structure with ARIA roles and SVG icons.
- **CSS3** — CSS custom properties, glassmorphism (`backdrop-filter`), CSS Grid & Flexbox, smooth animations.
- **JavaScript (ES6+)** — Fetch API, `async/await`, Canvas API (particle system), zero external runtime libraries.

### Backend
- **Python 3.10+**
- **Flask** — Lightweight routing and JSON REST APIs.
- **qrcode[pil]** — QR matrix computation with `ERROR_CORRECT_H` (30% recovery).
- **Pillow (PIL)** — High-definition image composition, watermarking, and banner rendering.

---

## 📂 Project Structure

```text
QR-Craft/
│
├── app.py                 # Flask app, API routes, QR generation & watermark logic
├── requirements.txt       # Python dependencies
├── README.md              # Project documentation
├── .gitignore
│
├── templates/
│   └── index.html         # Full SPA frontend (tabs, live preview, scanner, batch, history)
│
└── static/
    ├── style.css          # Dark glassmorphic design system & responsive layout
    └── script.js          # State engine, Fetch API, particle canvas, tab navigation
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Python 3.10 or higher
- pip

### 1. Clone the repository
```bash
git clone https://github.com/likhithgp2006/QR-Craft.git
cd QR-Craft
```

### 2. Create a virtual environment
```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```
> If blocked by execution policy: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the app
```bash
python app.py
```

### 6. Open in browser
```
http://127.0.0.1:5000
```

---

## 🔌 API Reference

### `POST /api/generate` — Generate QR Preview (Base64)
```json
// Request
{
  "text": "https://example.com",
  "foreground": "#111827",
  "background": "#ffffff",
  "watermark_text": "QRCraft",
  "watermark_text_color": "#8b5cf6",
  "watermark_opacity": 0.5,
  "watermark_style": "background",
  "bottom_text": "SCAN ME",
  "bottom_text_color": "#ffffff",
  "bottom_bg_color": "#6366f1",
  "output_size": 1024
}

// Response 200
{ "image": "data:image/png;base64,iVBORw0KGgo...", "filename": "qr-code.png" }

// Response 400
{ "error": "Please enter a URL or text." }
```

### `POST /api/download` — Download PNG
Returns a binary `image/png` stream as `qr-code.png`.

### `POST /api/download-svg` — Download SVG
Returns a scalable vector `image/svg+xml` stream as `qr-code.svg`.

### `POST /api/batch` — Batch ZIP Download
Accepts `{ "entries": [...], "fg": "#...", "bg": "#...", "size": 512 }` and returns a `application/zip` of all PNGs.

### `POST /api/scan` — Decode QR Image
Accepts a multipart image upload and returns `{ "results": [{ "type": "url", "data": "..." }] }`.

---

## 🛡 Security & Reliability

- **No Disk Storage** — All images are generated in RAM via `io.BytesIO` and immediately discarded.
- **Input Validation** — Text capped at 2,000 characters; hex colors strictly validated with regex.
- **Safe Error Handling** — Exceptions are caught and returned as friendly JSON messages without exposing stack traces.

---

## 📄 License

This project is licensed under the **MIT License** — free to use for portfolio, educational, or commercial projects.

---

<div align="center">
  <strong>Built with ❤️ by <a href="https://github.com/likhithgp2006">likhithgp2006</a></strong><br>
  <a href="https://qr-craft-beta.vercel.app/">🌐 Live Demo</a> &bull;
  <a href="https://github.com/likhithgp2006/QR-Craft">⭐ Star on GitHub</a>
</div>

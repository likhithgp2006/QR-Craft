# QR Studio — Smart QR Code Generator

> A production-quality, modern full-stack web application for generating, previewing, and downloading custom, high-definition QR codes with dynamic color customization and instant in-memory rendering.

---

## 🌟 Overview

**QR Studio** allows users to input any URL or text, customize foreground and background colors with interactive color pickers and curated palettes, preview the QR code in real-time, and download high-resolution PNG images.

Engineered with a **Python Flask** backend and a **Vanilla HTML5/CSS3/JavaScript** frontend boasting a dark glassmorphic design system.

---

## ✨ Features

- ⚡ **Instant Server-Side Generation**: QR codes are generated dynamically in Python using `qrcode[pil]` with high error correction (`ERROR_CORRECT_H`, 30% error recovery).
- 💧 **Faint Background Image Watermarks**: Blend custom images (PNG, JPG, SVG, WebP) or preset icons softly across the QR code at adjustable opacity (5%–40%) without obstructing smartphone scanners.
- ✍️ **Faint Background Text Watermarks**: Add background watermark text (such as **"inspire"**, **"CONFIDENTIAL"**, **"ORIGINAL"**, **"VIP"**) angled across the QR code.
- 🎨 **Custom Bottom Banner Colors**: Dedicated color pickers and presets for both **Text Color** and **Banner Background Color** on the bottom label.
- 🌌 **Interactive Animated Backgrounds**: Ambient particle constellation canvas, cybernetic grid textures, and floating typography layers with soft parallax drift.
- 🎨 **Atmosphere Theme Switcher**: Instant switching between 4 immersive visual themes:
  - 🌌 **Cosmic Nebula** (Purple / Indigo / Magenta)
  - ⚡ **Cyber Matrix** (Emerald / Cyan / Teal)
  - 🌅 **Sunset Pulse** (Rose / Amber / Coral)
  - 🌑 **Obsidian Dark** (Slate / Ice Blue / Silver)
- 🎨 **Full Color Customization**: Customize foreground and background colors with two-way synchronized hex inputs, HTML5 color pickers, and one-click presets.
- 🚀 **Quick Examples**: One-click preset chips for popular platforms (**Google**, **GitHub**, **Instagram**) that instantly populate and generate QR codes with corresponding logo badges.
- 🔍 **Real-Time Live Preview**: Animated reveal of generated QR codes with smooth transitions, empty-state guidance, and shimmer loading indicators.
- 📥 **Direct PNG Download**: Secure, seamless download (`qr-code.png`) streamed straight from server memory without page refreshes or lingering server files.
- 🔒 **Stateless & Secure**: Strict input length validation (<= 2000 chars), regex-based hex validation, zero eval usage, and pure in-memory `io.BytesIO` image processing.

---

## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic tags, accessible forms, ARIA live regions, and SVG icons.
- **CSS3**: Custom CSS variables, glassmorphism (`backdrop-filter`), CSS Grid & Flexbox, smooth transitions.
- **JavaScript (ES6+)**: Fetch API, `async/await`, dynamic DOM updates, Blob handling, zero external runtime libraries.

### Backend
- **Python 3.10+**: Core programming language.
- **Flask**: Micro web framework managing routing and JSON APIs.
- **qrcode[pil]**: QR code matrix computation with error correction.
- **Pillow (PIL)**: High-definition image rendering and color composition.

---

## 📂 Project Structure

```text
qr_generator_project/
│
├── app.py                 # Flask application, routing, validation, QR generation
├── requirements.txt       # Python package dependencies
├── README.md              # Project documentation and setup guide
│
├── templates/
│   └── index.html         # Main application UI template
│
└── static/
    ├── style.css          # Dark glassmorphic design system & responsive layout
    └── script.js          # Fetch API calls, state management, preview & download logic
```

---

## 🚀 Installation & Setup (Windows)

Follow these steps to run the project locally on Windows:

### 1. Open Terminal / PowerShell
Navigate to the project root directory:
```powershell
cd c:\Users\Dell\OneDrive\Desktop\qrcodegenerator
```

### 2. Create a Python Virtual Environment
```powershell
python -m venv venv
```

### 3. Activate the Virtual Environment
- In **PowerShell**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If PowerShell gives an execution policy warning, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

- In **Command Prompt (CMD)**:
  ```cmd
  venv\Scripts\activate.bat
  ```

### 4. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 5. Start the Application
```powershell
python app.py
```

### 6. Open in Your Browser
Open your favorite browser and visit:
```text
http://127.0.0.1:5000
```

*(For macOS / Linux users: activate via `source venv/bin/activate` and run the same commands)*

---

## 🔌 API Documentation

### 1. Generate QR Code (Base64 Preview)
- **Endpoint**: `POST /api/generate`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "text": "https://example.com",
    "foreground": "#111827",
    "background": "#ffffff"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "filename": "qr-code.png"
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "error": "Please enter a URL or text."
  }
  ```

---

### 2. Download QR Code File
- **Endpoint**: `POST /api/download`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "text": "https://example.com",
    "foreground": "#111827",
    "background": "#ffffff"
  }
  ```
- **Success Response (`200 OK`)**:
  - `Content-Type`: `image/png`
  - `Content-Disposition`: `attachment; filename=qr-code.png`
  - Body: Binary PNG stream.

---

## 🛡 Security & Reliability

- **No Disk Storage**: QR images are generated dynamically in RAM via `io.BytesIO` and immediately discarded, eliminating disk clutter and storage leakage.
- **Input Sanitization & Length Guard**: Text is capped at 2,000 characters and stripped of empty whitespace.
- **Color Validation**: Foreground and background values are strictly validated with hexadecimal regex (`^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`).
- **Safe Error Handling**: Python exceptions are logged internally and translated to user-friendly JSON messages without exposing internal stack traces.

---

## 💡 Future Enhancements

- [ ] Support for vector formats (**SVG**, **EPS**, **PDF**).
- [ ] Center logo/icon embedding (e.g., custom company or social icons).
- [ ] Dynamic QR codes with redirection and scan analytics.
- [ ] Wi-Fi network and vCard generator presets with dedicated input forms.

---

## 📄 License
This project is licensed under the MIT License — feel free to use it for portfolio, educational, or commercial projects!

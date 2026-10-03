/**
 * QR Studio — Full-Featured Engine (v5.0)
 * Tabs, Scanner, Batch, History, SVG Export, Copy Image, Share, Size Selector
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // Core Elements
  // =========================================================================
  const qrInput = document.getElementById('qrInput');
  const charCounter = document.getElementById('charCounter');
  const generateBtn = document.getElementById('generateBtn');
  const btnText = generateBtn.querySelector('.btn-text');
  const btnLoader = generateBtn.querySelector('.btn-loader');

  // Matrix Colors
  const fgColorInput = document.getElementById('fgColorInput');
  const fgSwatch = document.getElementById('fgSwatch');
  const fgHexText = document.getElementById('fgHexText');
  const bgColorInput = document.getElementById('bgColorInput');
  const bgSwatch = document.getElementById('bgSwatch');
  const bgHexText = document.getElementById('bgHexText');
  const swapColorsBtn = document.getElementById('swapColorsBtn');
  const presetPills = document.querySelectorAll('.preset-pill[data-fg]');
  const exampleChips = document.querySelectorAll('.example-chip');

  // Watermark Elements
  const wmStyleBtns = document.querySelectorAll('.wm-style-btn');
  const watermarkTextInput = document.getElementById('watermarkTextInput');
  const wmTextColorInput = document.getElementById('wmTextColorInput');
  const wmTextSwatch = document.getElementById('wmTextSwatch');
  const wmTextHex = document.getElementById('wmTextHex');

  // Watermark Image & Opacity
  const wmImageChips = document.querySelectorAll('.wm-image-chip');
  const logoUploadBox = document.getElementById('logoUploadBox');
  const logoFileInput = document.getElementById('logoFileInput');
  const uploadPrompt = document.getElementById('uploadPrompt');
  const uploadedLogoPreview = document.getElementById('uploadedLogoPreview');
  const logoThumb = document.getElementById('logoThumb');
  const logoFileName = document.getElementById('logoFileName');
  const removeLogoBtn = document.getElementById('removeLogoBtn');
  const opacitySlider = document.getElementById('opacitySlider');
  const opacityValueDisplay = document.getElementById('opacityValueDisplay');

  // Bottom Banner
  const bottomTextInput = document.getElementById('bottomTextInput');
  const bottomTextColorInput = document.getElementById('bottomTextColorInput');
  const bottomTextSwatch = document.getElementById('bottomTextSwatch');
  const bottomTextHex = document.getElementById('bottomTextHex');
  const bottomBgColorInput = document.getElementById('bottomBgColorInput');
  const bottomBgSwatch = document.getElementById('bottomBgSwatch');
  const bottomBgHex = document.getElementById('bottomBgHex');
  const bannerColorPresets = document.querySelectorAll('.banner-color-preset');

  // Preview
  const qrImage = document.getElementById('qrImage');
  const previewStatusBadge = document.getElementById('previewStatusBadge');
  const qrTimestamp = document.getElementById('qrTimestamp');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const copyBtnText = document.getElementById('copyBtnText');

  // New Action Buttons
  const downloadSvgBtn = document.getElementById('downloadSvgBtn');
  const copyImageBtn = document.getElementById('copyImageBtn');
  const copyImageBtnText = document.getElementById('copyImageBtnText');
  const shareBtn = document.getElementById('shareBtn');
  const shareBtnText = document.getElementById('shareBtnText');

  // Size Selector
  const sizePills = document.querySelectorAll('.size-pill:not(.batch-size-pill)');

  // Alerts & Themes
  const alertBanner = document.getElementById('alertBanner');
  const alertMessage = document.getElementById('alertMessage');
  const alertCloseBtn = document.getElementById('alertCloseBtn');
  const themePills = document.querySelectorAll('.theme-pill');

  // Tab Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = {
    generate: document.getElementById('tabPanelGenerate'),
    scan: document.getElementById('tabPanelScan'),
    batch: document.getElementById('tabPanelBatch'),
    history: document.getElementById('tabPanelHistory'),
  };

  // Scanner Elements
  const scanUploadZone = document.getElementById('scanUploadZone');
  const scanFileInput = document.getElementById('scanFileInput');
  const scanUploadPrompt = document.getElementById('scanUploadPrompt');
  const scanPreviewWrap = document.getElementById('scanPreviewWrap');
  const scanImagePreview = document.getElementById('scanImagePreview');
  const scanResetBtn = document.getElementById('scanResetBtn');
  const decodeBtn = document.getElementById('decodeBtn');
  const decodeBtnText = document.getElementById('decodeBtnText');
  const decodeBtnLoader = document.getElementById('decodeBtnLoader');
  const decodeResults = document.getElementById('decodeResults');
  const decodeResultList = document.getElementById('decodeResultList');

  // Batch Elements
  const batchInput = document.getElementById('batchInput');
  const batchCounter = document.getElementById('batchCounter');
  const batchFgColor = document.getElementById('batchFgColor');
  const batchFgSwatch = document.getElementById('batchFgSwatch');
  const batchFgHex = document.getElementById('batchFgHex');
  const batchBgColor = document.getElementById('batchBgColor');
  const batchBgSwatch = document.getElementById('batchBgSwatch');
  const batchBgHex = document.getElementById('batchBgHex');
  const batchSizePills = document.querySelectorAll('.batch-size-pill');
  const batchGenerateBtn = document.getElementById('batchGenerateBtn');
  const batchBtnText = document.getElementById('batchBtnText');
  const batchBtnLoader = document.getElementById('batchBtnLoader');

  // History Elements
  const historyGrid = document.getElementById('historyGrid');
  const historyEmpty = document.getElementById('historyEmpty');
  const historyTabBadge = document.getElementById('historyTabBadge');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // =========================================================================
  // Application State
  // =========================================================================
  const state = {
    currentText: qrInput && qrInput.value ? qrInput.value.trim() : 'https://example.com',
    currentFg: '#111827',
    currentBg: '#ffffff',
    watermarkText: '',
    watermarkTextColor: '#8b5cf6',
    watermarkImage: null,
    watermarkOpacity: 0.50,
    watermarkStyle: 'background',
    bottomText: '',
    bottomTextColor: '#ffffff',
    bottomBgColor: '#6366f1',
    activeTheme: 'theme-nebula',
    outputSize: 1024,
    isGenerating: false,
    activeTab: 'generate',
    scanImageData: null,
    batchSize: 512,
    lastGeneratedImage: null,
  };

  const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  const HISTORY_KEY = 'qrstudio_history';
  const MAX_HISTORY = 20;
  let debounceTimer = null;

  function autoGenerate(delayMs = 250) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      generate(false);
    }, delayMs);
  }

  // =========================================================================
  // 1. Tab Navigation
  // =========================================================================
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  function switchTab(tab) {
    state.activeTab = tab;
    tabBtns.forEach((b) => {
      const isActive = b.getAttribute('data-tab') === tab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    Object.entries(tabPanels).forEach(([key, panel]) => {
      if (panel) {
        const isActive = key === tab;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      }
    });
    if (tab === 'history') renderHistory();
  }

  // =========================================================================
  // 2. Particle Background Canvas
  // =========================================================================
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  function getThemeParticleColor() {
    switch (state.activeTheme) {
      case 'theme-matrix':
        return { dot: 'rgba(16, 185, 129, 0.45)', line: 'rgba(16, 185, 129, 0.08)' };
      case 'theme-sunset':
        return { dot: 'rgba(244, 63, 94, 0.45)', line: 'rgba(244, 63, 94, 0.08)' };
      case 'theme-obsidian':
        return { dot: 'rgba(56, 189, 248, 0.45)', line: 'rgba(56, 189, 248, 0.08)' };
      default:
        return { dot: 'rgba(139, 92, 246, 0.45)', line: 'rgba(139, 92, 246, 0.08)' };
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 65);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.8,
      });
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = getThemeParticleColor();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.dot;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = colors.line;
          ctx.lineWidth = 1 - dist / 130;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animateParticles();

  // Atmosphere Switcher
  themePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      themePills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const theme = pill.getAttribute('data-theme');
      document.body.className = theme;
      state.activeTheme = theme;
    });
  });

  // =========================================================================
  // 3. Preset Watermark Image Generators
  // =========================================================================
  function createPresetWatermarkBase64(type) {
    const size = 200;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size;
    offCanvas.height = size;
    const c = offCanvas.getContext('2d');

    c.fillStyle = '#6366f1';

    if (type === 'star') {
      c.font = 'bold 130px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('★', size / 2, size / 2);
    } else if (type === 'heart') {
      c.fillStyle = '#f43f5e';
      c.font = 'bold 120px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('♥', size / 2, size / 2);
    } else if (type === 'shield') {
      c.fillStyle = '#10b981';
      c.font = 'bold 120px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('🛡️', size / 2, size / 2);
    } else if (type === 'crown') {
      c.fillStyle = '#f59e0b';
      c.font = 'bold 120px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('👑', size / 2, size / 2);
    }

    return offCanvas.toDataURL('image/png');
  }

  // Watermark Style Mode
  wmStyleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      wmStyleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.watermarkStyle = btn.getAttribute('data-style');
      autoGenerate(50);
    });
  });

  // =========================================================================
  // 4. Watermark Text & Color
  // =========================================================================
  watermarkTextInput.addEventListener('input', () => {
    state.watermarkText = watermarkTextInput.value.trim();
    autoGenerate(200);
  });

  function updateWatermarkTextColor(color) {
    if (color && HEX_REGEX.test(color)) {
      state.watermarkTextColor = color;
      wmTextColorInput.value = color;
      wmTextSwatch.style.backgroundColor = color;
      wmTextHex.value = color.toUpperCase();
    }
  }

  wmTextColorInput.addEventListener('input', (e) => {
    updateWatermarkTextColor(e.target.value);
    autoGenerate(100);
  });

  wmTextHex.addEventListener('change', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (HEX_REGEX.test(val)) updateWatermarkTextColor(val);
    else wmTextHex.value = state.watermarkTextColor.toUpperCase();
    autoGenerate(100);
  });

  // =========================================================================
  // 5. Watermark Image & Opacity Handlers
  // =========================================================================
  wmImageChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      wmImageChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const preset = chip.getAttribute('data-preset');

      if (preset === 'none') {
        state.watermarkImage = null;
        uploadPrompt.hidden = false;
        uploadedLogoPreview.hidden = true;
      } else {
        const imgData = createPresetWatermarkBase64(preset);
        state.watermarkImage = imgData;
        logoThumb.src = imgData;
        logoFileName.textContent = `${preset.toUpperCase()} Watermark`;
        uploadPrompt.hidden = true;
        uploadedLogoPreview.hidden = false;
      }

      autoGenerate(50);
    });
  });

  logoUploadBox.addEventListener('click', (e) => {
    if (e.target.id === 'removeLogoBtn') return;
    logoFileInput.click();
  });

  logoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target.result;
      state.watermarkImage = dataUrl;
      logoThumb.src = dataUrl;
      logoFileName.textContent = file.name;
      uploadPrompt.hidden = true;
      uploadedLogoPreview.hidden = false;

      wmImageChips.forEach((c) => c.classList.remove('active'));
      autoGenerate(50);
    };
    reader.readAsDataURL(file);
  });

  removeLogoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.watermarkImage = null;
    logoFileInput.value = '';
    uploadPrompt.hidden = false;
    uploadedLogoPreview.hidden = true;
    wmImageChips.forEach((c) => {
      if (c.getAttribute('data-preset') === 'none') c.classList.add('active');
      else c.classList.remove('active');
    });
    autoGenerate(50);
  });

  opacitySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.watermarkOpacity = val / 100;
    opacityValueDisplay.textContent = `${val}% (High Visibility)`;
    autoGenerate(100);
  });

  // =========================================================================
  // 6. Bottom Text & Colors
  // =========================================================================
  bottomTextInput.addEventListener('input', () => {
    state.bottomText = bottomTextInput.value.trim();
    autoGenerate(200);
  });

  function updateBottomColors(textColor, bgColor) {
    if (textColor && HEX_REGEX.test(textColor)) {
      state.bottomTextColor = textColor;
      bottomTextColorInput.value = textColor;
      bottomTextSwatch.style.backgroundColor = textColor;
      bottomTextHex.value = textColor.toUpperCase();
    }
    if (bgColor && HEX_REGEX.test(bgColor)) {
      state.bottomBgColor = bgColor;
      bottomBgColorInput.value = bgColor;
      bottomBgSwatch.style.backgroundColor = bgColor;
      bottomBgHex.value = bgColor.toUpperCase();
    }
  }

  bottomTextColorInput.addEventListener('input', (e) => {
    updateBottomColors(e.target.value, null);
    autoGenerate(100);
  });

  bottomBgColorInput.addEventListener('input', (e) => {
    updateBottomColors(null, e.target.value);
    autoGenerate(100);
  });

  bottomTextHex.addEventListener('change', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (HEX_REGEX.test(val)) updateBottomColors(val, null);
    else bottomTextHex.value = state.bottomTextColor.toUpperCase();
    autoGenerate(100);
  });

  bottomBgHex.addEventListener('change', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (HEX_REGEX.test(val)) updateBottomColors(null, val);
    else bottomBgHex.value = state.bottomBgColor.toUpperCase();
    autoGenerate(100);
  });

  bannerColorPresets.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textCol = btn.getAttribute('data-text');
      const bgCol = btn.getAttribute('data-bg');
      updateBottomColors(textCol, bgCol);
      autoGenerate(50);
    });
  });

  // =========================================================================
  // 7. QR Matrix Colors
  // =========================================================================
  function updateColors(fg, bg) {
    if (fg && HEX_REGEX.test(fg)) {
      state.currentFg = fg;
      fgColorInput.value = fg.length === 4 ? expandHex(fg) : fg;
      fgSwatch.style.backgroundColor = fg;
      fgHexText.value = fg.toUpperCase();
    }
    if (bg && HEX_REGEX.test(bg)) {
      state.currentBg = bg;
      bgColorInput.value = bg.length === 4 ? expandHex(bg) : bg;
      bgSwatch.style.backgroundColor = bg;
      bgHexText.value = bg.toUpperCase();
    }
  }

  function expandHex(hex) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }

  fgColorInput.addEventListener('input', (e) => {
    updateColors(e.target.value, null);
    autoGenerate(100);
  });

  bgColorInput.addEventListener('input', (e) => {
    updateColors(null, e.target.value);
    autoGenerate(100);
  });

  fgHexText.addEventListener('change', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (HEX_REGEX.test(val)) updateColors(val, null);
    else fgHexText.value = state.currentFg.toUpperCase();
    autoGenerate(100);
  });

  bgHexText.addEventListener('change', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (HEX_REGEX.test(val)) updateColors(null, val);
    else bgHexText.value = state.currentBg.toUpperCase();
    autoGenerate(100);
  });

  swapColorsBtn.addEventListener('click', () => {
    const tempFg = state.currentFg;
    updateColors(state.currentBg, tempFg);
    autoGenerate(50);
  });

  presetPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      updateColors(pill.getAttribute('data-fg'), pill.getAttribute('data-bg'));
      autoGenerate(50);
    });
  });

  // Quick Examples
  exampleChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      qrInput.value = chip.getAttribute('data-url');
      updateCharCount();
      hideAlert();
      autoGenerate(20);
    });
  });

  // =========================================================================
  // 8. Output Size Selector
  // =========================================================================
  sizePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      sizePills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.outputSize = parseInt(pill.getAttribute('data-size'), 10);
      autoGenerate(50);
    });
  });

  // =========================================================================
  // 9. Input, Typing & Instant Paste Handling
  // =========================================================================
  function updateCharCount() {
    const len = qrInput.value.length;
    charCounter.textContent = `${len} / 2000`;
    charCounter.style.color = len > 2000 ? 'var(--color-error)' : 'var(--text-muted)';
  }

  qrInput.addEventListener('input', () => {
    updateCharCount();
    if (qrInput.value.trim().length > 0) {
      hideAlert();
    }
    autoGenerate(250);
  });

  // Instant generation on paste & automatic error removal
  qrInput.addEventListener('paste', () => {
    setTimeout(() => {
      updateCharCount();
      hideAlert();
      generate(false);
    }, 20);
  });

  qrInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generate(true);
    }
  });

  function showAlert(msg, type = 'error') {
    alertMessage.textContent = msg;
    alertBanner.hidden = false;
    alertBanner.classList.remove('alert-success');
    if (type === 'success') alertBanner.classList.add('alert-success');
  }

  function hideAlert() {
    alertBanner.hidden = true;
  }

  alertCloseBtn.addEventListener('click', hideAlert);

  // =========================================================================
  // 10. Generate QR Code (Fetch API)
  // =========================================================================
  function setLoading(isLoading) {
    state.isGenerating = isLoading;
    generateBtn.disabled = isLoading;
    if (isLoading) {
      btnText.hidden = true;
      btnLoader.hidden = false;
    } else {
      btnText.hidden = false;
      btnLoader.hidden = true;
    }
  }

  function buildPayload() {
    const rawText = qrInput.value.trim();
    const currentWmText = watermarkTextInput ? watermarkTextInput.value.trim() : '';
    const currentBottomText = bottomTextInput ? bottomTextInput.value.trim() : '';

    return {
      text: rawText,
      foreground: state.currentFg,
      background: state.currentBg,
      watermark_text: currentWmText,
      watermark_text_color: state.watermarkTextColor,
      watermark_image: state.watermarkImage,
      watermark_opacity: state.watermarkOpacity,
      watermark_style: state.watermarkStyle,
      bottom_text: currentBottomText,
      bottom_text_color: state.bottomTextColor,
      bottom_bg_color: state.bottomBgColor,
      output_size: state.outputSize,
    };
  }

  async function generate(showSpinner = true) {
    const rawText = qrInput.value.trim();

    if (!rawText) {
      if (showSpinner) showAlert('Please enter a URL or text.');
      return;
    }

    hideAlert();
    if (showSpinner) setLoading(true);

    try {
      const payload = buildPayload();
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate QR code.');

      state.currentText = rawText;
      state.watermarkText = payload.watermark_text;
      state.bottomText = payload.bottom_text;
      state.lastGeneratedImage = data.image;

      // Update Live Preview Image
      qrImage.src = data.image;

      // Update Meta
      previewStatusBadge.textContent = 'Live Ready';
      previewStatusBadge.className = 'tag-pill tag-ready';
      qrTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Enable Download & Copy
      downloadBtn.disabled = false;
      copyUrlBtn.disabled = false;
      if (downloadSvgBtn) downloadSvgBtn.disabled = false;
      if (copyImageBtn) copyImageBtn.disabled = false;
      if (shareBtn) shareBtn.disabled = false;

      // Save to history
      addToHistory(rawText, data.image);
    } catch (error) {
      if (showSpinner) {
        showAlert(error.message || 'Something went wrong rendering the QR code.');
        previewStatusBadge.textContent = 'Error';
        previewStatusBadge.className = 'tag-pill tag-idle';
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  generateBtn.addEventListener('click', () => generate(true));

  // =========================================================================
  // 11. Download PNG
  // =========================================================================
  async function downloadQR() {
    const rawText = qrInput.value.trim() || state.currentText;
    if (!rawText) {
      showAlert('Please enter text to generate a QR code.');
      return;
    }

    try {
      downloadBtn.disabled = true;
      const payload = buildPayload();
      payload.text = rawText;

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to download image.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showAlert('QR code downloaded successfully!', 'success');
      setTimeout(hideAlert, 4000);
    } catch (error) {
      showAlert(error.message || 'Error occurred downloading the image.');
    } finally {
      downloadBtn.disabled = false;
    }
  }

  downloadBtn.addEventListener('click', downloadQR);

  // =========================================================================
  // 12. Download SVG
  // =========================================================================
  if (downloadSvgBtn) {
    downloadSvgBtn.addEventListener('click', async () => {
      const rawText = qrInput.value.trim() || state.currentText;
      if (!rawText) {
        showAlert('Please enter text to generate a QR code.');
        return;
      }

      try {
        downloadSvgBtn.disabled = true;
        const response = await fetch('/api/download-svg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: rawText,
            foreground: state.currentFg,
            background: state.currentBg,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to download SVG.');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'qr-code.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        showAlert('SVG exported successfully!', 'success');
        setTimeout(hideAlert, 4000);
      } catch (error) {
        showAlert(error.message || 'Error exporting SVG.');
      } finally {
        downloadSvgBtn.disabled = false;
      }
    });
  }

  // =========================================================================
  // 13. Copy Image to Clipboard
  // =========================================================================
  if (copyImageBtn) {
    copyImageBtn.addEventListener('click', async () => {
      if (!state.lastGeneratedImage) {
        showAlert('Generate a QR code first.');
        return;
      }
      try {
        // Convert data URL to blob
        const response = await fetch(state.lastGeneratedImage);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        const orig = copyImageBtnText.textContent;
        copyImageBtnText.textContent = 'Copied!';
        setTimeout(() => { copyImageBtnText.textContent = orig; }, 2000);
      } catch (err) {
        // Fallback: try copying via canvas
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = state.lastGeneratedImage;
          await new Promise((resolve) => { img.onload = resolve; });
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = img.naturalWidth;
          tempCanvas.height = img.naturalHeight;
          tempCanvas.getContext('2d').drawImage(img, 0, 0);
          const pngBlob = await new Promise(r => tempCanvas.toBlob(r, 'image/png'));
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
          copyImageBtnText.textContent = 'Copied!';
          setTimeout(() => { copyImageBtnText.textContent = 'Copy Img'; }, 2000);
        } catch (e2) {
          showAlert('Unable to copy image. Your browser may not support this feature.');
        }
      }
    });
  }

  // Copy URL / Content
  copyUrlBtn.addEventListener('click', async () => {
    const val = qrInput.value.trim() || state.currentText;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      const orig = copyBtnText.textContent;
      copyBtnText.textContent = 'Copied!';
      setTimeout(() => { copyBtnText.textContent = orig; }, 2000);
    } catch (err) {
      showAlert('Unable to copy text automatically.');
    }
  });

  // =========================================================================
  // 14. Share Button (Web Share API)
  // =========================================================================
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const text = qrInput.value.trim() || state.currentText;
      if (!text) {
        showAlert('Generate a QR code first.');
        return;
      }

      // Try native Web Share API first
      if (navigator.share) {
        try {
          const shareData = { title: 'QRCraft', text: `QR Code for: ${text}`, url: text.startsWith('http') ? text : undefined };

          // Try sharing the image file if supported
          if (state.lastGeneratedImage && navigator.canShare) {
            try {
              const resp = await fetch(state.lastGeneratedImage);
              const blob = await resp.blob();
              const file = new File([blob], 'qr-code.png', { type: 'image/png' });
              const fileShareData = { ...shareData, files: [file] };
              if (navigator.canShare(fileShareData)) {
                await navigator.share(fileShareData);
                return;
              }
            } catch (e) { /* fall through to text-only share */ }
          }

          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err.name === 'AbortError') return; // user cancelled
        }
      }

      // Fallback: copy link
      try {
        const shareUrl = text.startsWith('http') ? text : window.location.href;
        await navigator.clipboard.writeText(shareUrl);
        const orig = shareBtnText.textContent;
        shareBtnText.textContent = 'Link Copied!';
        setTimeout(() => { shareBtnText.textContent = orig; }, 2500);
      } catch (err) {
        showAlert('Unable to share. Try copying the URL manually.');
      }
    });
  }

  // =========================================================================
  // 15. QR Scanner / Decoder
  // =========================================================================
  if (scanUploadZone) {
    scanUploadZone.addEventListener('click', (e) => {
      if (e.target === scanResetBtn || e.target.closest('#scanResetBtn')) return;
      if (!scanPreviewWrap.hidden) return;
      scanFileInput.click();
    });

    // Drag & drop support
    scanUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      scanUploadZone.classList.add('drag-over');
    });
    scanUploadZone.addEventListener('dragleave', () => {
      scanUploadZone.classList.remove('drag-over');
    });
    scanUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      scanUploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadScanImage(file);
      }
    });
  }

  if (scanFileInput) {
    scanFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) loadScanImage(file);
    });
  }

  function loadScanImage(file) {
    if (!file.type.startsWith('image/')) {
      showAlert('Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      state.scanImageData = ev.target.result;
      scanImagePreview.src = ev.target.result;
      scanUploadPrompt.hidden = true;
      scanPreviewWrap.hidden = false;
      decodeBtn.disabled = false;
      decodeResults.hidden = true;
    };
    reader.readAsDataURL(file);
  }

  if (scanResetBtn) {
    scanResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.scanImageData = null;
      scanFileInput.value = '';
      scanUploadPrompt.hidden = false;
      scanPreviewWrap.hidden = true;
      decodeBtn.disabled = true;
      decodeResults.hidden = true;
    });
  }

  if (decodeBtn) {
    decodeBtn.addEventListener('click', async () => {
      if (!state.scanImageData) return;

      decodeBtn.disabled = true;
      decodeBtnText.hidden = true;
      decodeBtnLoader.hidden = false;
      decodeResults.hidden = true;

      try {
        const response = await fetch('/api/decode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: state.scanImageData }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to decode QR code.');
        }

        // Show results
        decodeResultList.innerHTML = '';
        data.results.forEach((result, idx) => {
          const item = document.createElement('div');
          item.className = 'decode-result-item';

          const isUrl = /^https?:\/\//i.test(result.data);
          const contentHtml = isUrl
            ? `<a href="${escapeHtml(result.data)}" target="_blank" rel="noopener noreferrer" class="decode-link">${escapeHtml(result.data)}</a>`
            : `<span class="decode-text">${escapeHtml(result.data)}</span>`;

          item.innerHTML = `
            <div class="decode-item-header">
              <span class="decode-type-badge">${escapeHtml(result.type)}</span>
              <button type="button" class="decode-copy-btn" data-copy="${escapeHtml(result.data)}" title="Copy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copy
              </button>
            </div>
            <div class="decode-item-content">${contentHtml}</div>
          `;
          decodeResultList.appendChild(item);
        });

        decodeResults.hidden = false;

        // Wire up copy buttons
        decodeResultList.querySelectorAll('.decode-copy-btn').forEach((btn) => {
          btn.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(btn.getAttribute('data-copy'));
              btn.textContent = '✓ Copied';
              setTimeout(() => {
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy`;
              }, 2000);
            } catch (e) { /* ignore */ }
          });
        });
      } catch (error) {
        decodeResultList.innerHTML = `<div class="decode-error">${escapeHtml(error.message)}</div>`;
        decodeResults.hidden = false;
      } finally {
        decodeBtn.disabled = false;
        decodeBtnText.hidden = false;
        decodeBtnLoader.hidden = true;
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // =========================================================================
  // 16. Batch Generator
  // =========================================================================
  if (batchInput) {
    batchInput.addEventListener('input', () => {
      const lines = batchInput.value.split('\n').filter(l => l.trim().length > 0);
      const count = Math.min(lines.length, 50);
      batchCounter.textContent = `${count} / 50 entries`;
      batchGenerateBtn.disabled = count === 0;
    });
  }

  // Batch color pickers
  if (batchFgColor) {
    batchFgColor.addEventListener('input', (e) => {
      batchFgSwatch.style.backgroundColor = e.target.value;
      batchFgHex.value = e.target.value.toUpperCase();
    });
    batchFgHex.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (HEX_REGEX.test(val)) {
        batchFgColor.value = val;
        batchFgSwatch.style.backgroundColor = val;
        batchFgHex.value = val.toUpperCase();
      }
    });
  }

  if (batchBgColor) {
    batchBgColor.addEventListener('input', (e) => {
      batchBgSwatch.style.backgroundColor = e.target.value;
      batchBgHex.value = e.target.value.toUpperCase();
    });
    batchBgHex.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (HEX_REGEX.test(val)) {
        batchBgColor.value = val;
        batchBgSwatch.style.backgroundColor = val;
        batchBgHex.value = val.toUpperCase();
      }
    });
  }

  // Batch size pills
  batchSizePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      batchSizePills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.batchSize = parseInt(pill.getAttribute('data-size'), 10);
    });
  });

  // Batch generate
  if (batchGenerateBtn) {
    batchGenerateBtn.addEventListener('click', async () => {
      const lines = batchInput.value.split('\n').filter(l => l.trim().length > 0).slice(0, 50);
      if (lines.length === 0) {
        showAlert('Please enter at least one URL or text.');
        return;
      }

      batchGenerateBtn.disabled = true;
      batchBtnText.hidden = true;
      batchBtnLoader.hidden = false;

      try {
        const response = await fetch('/api/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entries: lines.map(l => l.trim()),
            foreground: batchFgColor ? batchFgColor.value : '#111827',
            background: batchBgColor ? batchBgColor.value : '#ffffff',
            output_size: state.batchSize,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Batch generation failed.');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'qr-codes-batch.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        showAlert(`${lines.length} QR codes generated and downloaded as ZIP!`, 'success');
        setTimeout(hideAlert, 5000);
      } catch (error) {
        showAlert(error.message || 'Batch generation failed.');
      } finally {
        batchGenerateBtn.disabled = false;
        batchBtnText.hidden = false;
        batchBtnLoader.hidden = true;
      }
    });
  }

  // =========================================================================
  // 17. History (localStorage)
  // =========================================================================
  function getHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveHistory(history) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch { /* storage full, ignore */ }
  }

  function addToHistory(text, imageDataUrl) {
    const history = getHistory();
    // Avoid duplicating the same text back-to-back
    if (history.length > 0 && history[0].text === text) {
      history[0].image = imageDataUrl;
      history[0].timestamp = Date.now();
    } else {
      history.unshift({
        text: text,
        image: imageDataUrl,
        timestamp: Date.now(),
      });
    }
    // Keep only MAX_HISTORY items
    while (history.length > MAX_HISTORY) history.pop();
    saveHistory(history);
    updateHistoryBadge();
  }

  function updateHistoryBadge() {
    const count = getHistory().length;
    if (historyTabBadge) {
      historyTabBadge.textContent = count;
      historyTabBadge.hidden = count === 0;
    }
  }

  function renderHistory() {
    const history = getHistory();
    // Remove all dynamic items (keep the empty state element)
    const items = historyGrid.querySelectorAll('.history-item');
    items.forEach(el => el.remove());

    if (history.length === 0) {
      historyEmpty.hidden = false;
      return;
    }

    historyEmpty.hidden = true;
    history.forEach((entry, idx) => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.innerHTML = `
        <div class="history-thumb-wrap">
          <img src="${entry.image}" alt="QR code" class="history-thumb" loading="lazy">
        </div>
        <div class="history-item-info">
          <span class="history-item-text" title="${escapeHtml(entry.text)}">${escapeHtml(truncate(entry.text, 40))}</span>
          <span class="history-item-time">${formatTime(entry.timestamp)}</span>
        </div>
        <div class="history-item-actions">
          <button type="button" class="history-action-btn history-use-btn" title="Use this text" data-idx="${idx}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="m15 15-6-6m0 6 6-6"/></svg>
            Use
          </button>
          <button type="button" class="history-action-btn history-dl-btn" title="Download" data-idx="${idx}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" y2="3"/></svg>
          </button>
          <button type="button" class="history-action-btn history-del-btn" title="Delete" data-idx="${idx}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;
      historyGrid.appendChild(card);
    });

    // Wire up action buttons
    historyGrid.querySelectorAll('.history-use-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const h = getHistory();
        if (h[idx]) {
          qrInput.value = h[idx].text;
          updateCharCount();
          switchTab('generate');
          autoGenerate(20);
        }
      });
    });

    historyGrid.querySelectorAll('.history-dl-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const h = getHistory();
        if (h[idx] && h[idx].image) {
          const link = document.createElement('a');
          link.href = h[idx].image;
          link.download = `qr-${idx + 1}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    });

    historyGrid.querySelectorAll('.history-del-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const h = getHistory();
        h.splice(idx, 1);
        saveHistory(h);
        updateHistoryBadge();
        renderHistory();
      });
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      localStorage.removeItem(HISTORY_KEY);
      updateHistoryBadge();
      renderHistory();
    });
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  function formatTime(timestamp) {
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // =========================================================================
  // 18. Initialization
  // =========================================================================
  updateColors(state.currentFg, state.currentBg);
  updateWatermarkTextColor(state.watermarkTextColor);
  updateBottomColors(state.bottomTextColor, state.bottomBgColor);
  updateCharCount();
  updateHistoryBadge();

  // Instant render live preview immediately on load!
  generate(false);
});

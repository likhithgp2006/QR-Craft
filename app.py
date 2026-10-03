import os
import io
import re
import math
import base64
import zipfile
import json
from flask import Flask, request, jsonify, render_template, send_file
from PIL import Image, ImageDraw, ImageFont, ImageOps
import qrcode
import qrcode.image.svg
from qrcode.constants import ERROR_CORRECT_H

# Optional: QR decode support
try:
    from pyzbar import pyzbar
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

HEX_COLOR_REGEX = re.compile(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
MAX_TEXT_LENGTH = 2000
MAX_LABEL_LENGTH = 40
DEFAULT_FOREGROUND = "#111827"
DEFAULT_BACKGROUND = "#ffffff"
DEFAULT_WM_TEXT_COLOR = "#8b5cf6"
DEFAULT_BOTTOM_TEXT_COLOR = "#ffffff"
DEFAULT_BOTTOM_BG_COLOR = "#6366f1"

VALID_SIZES = {512: 8, 768: 10, 1024: 12, 2048: 20}


@app.after_request
def add_header(response):
    """Disable browser caching so frontend updates apply immediately."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


def get_truetype_font(size):
    """Load a clean system Truetype font on Windows with graceful fallback."""
    candidate_fonts = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    for font_path in candidate_fonts:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def hex_to_rgb(hex_color):
    """Convert hex string (e.g. #ffffff or #fff) to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def validate_and_extract_payload(data):
    """Validate request payload and return cleaned parameters."""
    if not isinstance(data, dict):
        raise ValueError("Invalid request format. Expected JSON object.")

    text = data.get("text")
    if not text or not isinstance(text, str) or not text.strip():
        raise ValueError("Please enter a URL or text.")

    text = text.strip()
    if len(text) > MAX_TEXT_LENGTH:
        raise ValueError(
            f"Input text too long. Maximum allowed is {MAX_TEXT_LENGTH} characters."
        )

    foreground = data.get("foreground", DEFAULT_FOREGROUND)
    if not isinstance(foreground, str) or not HEX_COLOR_REGEX.match(foreground.strip()):
        raise ValueError("Invalid foreground color format. Must be a valid hex color code (e.g., #111827).")
    foreground = foreground.strip()

    background = data.get("background", DEFAULT_BACKGROUND)
    if not isinstance(background, str) or not HEX_COLOR_REGEX.match(background.strip()):
        raise ValueError("Invalid background color format. Must be a valid hex color code (e.g., #ffffff).")
    background = background.strip()

    # Watermark Image (optional Base64)
    watermark_image = data.get("watermark_image") or data.get("logo")
    if watermark_image and not isinstance(watermark_image, str):
        watermark_image = None

    # Watermark Text (any custom text user enters)
    watermark_text = data.get("watermark_text", "")
    if watermark_text and isinstance(watermark_text, str):
        watermark_text = watermark_text.strip()[:MAX_LABEL_LENGTH]
    else:
        watermark_text = ""

    # Watermark Text Color
    watermark_text_color = data.get("watermark_text_color", DEFAULT_WM_TEXT_COLOR)
    if not isinstance(watermark_text_color, str) or not HEX_COLOR_REGEX.match(watermark_text_color.strip()):
        watermark_text_color = DEFAULT_WM_TEXT_COLOR
    watermark_text_color = watermark_text_color.strip()

    # Watermark Opacity (0.10 to 0.85, default 0.45)
    try:
        watermark_opacity = float(data.get("watermark_opacity", 0.45))
        watermark_opacity = max(0.10, min(0.85, watermark_opacity))
    except (ValueError, TypeError):
        watermark_opacity = 0.45

    # Watermark Style ('background' or 'center')
    watermark_style = data.get("watermark_style", "background")
    if watermark_style not in ["background", "center"]:
        watermark_style = "background"

    # Bottom Banner Text & Colors
    bottom_text = data.get("bottom_text") or data.get("label", "")
    if bottom_text and isinstance(bottom_text, str):
        bottom_text = bottom_text.strip()[:MAX_LABEL_LENGTH]
    else:
        bottom_text = ""

    bottom_text_color = data.get("bottom_text_color", DEFAULT_BOTTOM_TEXT_COLOR)
    if not isinstance(bottom_text_color, str) or not HEX_COLOR_REGEX.match(bottom_text_color.strip()):
        bottom_text_color = DEFAULT_BOTTOM_TEXT_COLOR
    bottom_text_color = bottom_text_color.strip()

    bottom_bg_color = data.get("bottom_bg_color", DEFAULT_BOTTOM_BG_COLOR)
    if not isinstance(bottom_bg_color, str) or not HEX_COLOR_REGEX.match(bottom_bg_color.strip()):
        bottom_bg_color = DEFAULT_BOTTOM_BG_COLOR
    bottom_bg_color = bottom_bg_color.strip()

    # Output size (pixels)
    try:
        output_size = int(data.get("output_size", 1024))
        if output_size not in VALID_SIZES:
            output_size = 1024
    except (ValueError, TypeError):
        output_size = 1024

    return (
        text,
        foreground,
        background,
        watermark_image,
        watermark_text,
        watermark_text_color,
        watermark_opacity,
        watermark_style,
        bottom_text,
        bottom_text_color,
        bottom_bg_color,
        output_size,
    )


def create_qr_image(
    text,
    foreground,
    background,
    watermark_image=None,
    watermark_text="",
    watermark_text_color="#8b5cf6",
    watermark_opacity=0.45,
    watermark_style="background",
    bottom_text="",
    bottom_text_color="#ffffff",
    bottom_bg_color="#6366f1",
    output_size=1024,
):
    """Generate high-definition QR code with optional watermarks and banner."""
    box_size = VALID_SIZES.get(output_size, 12)

    # 1. Generate QR Code Matrix with High Error Correction (30% error recovery)
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=box_size,
        border=4,
    )
    qr.add_data(text)
    qr.make(fit=True)

    fg_rgb = hex_to_rgb(foreground)
    bg_rgb = hex_to_rgb(background)

    # 2. Extract 1-bit module mask (modules = 255, background = 0)
    base_qr = qr.make_image(fill_color="black", back_color="white").convert("L")
    module_mask = ImageOps.invert(base_qr)

    # 3. Create transparent layer containing ONLY dark modules
    qr_matrix = Image.new("RGBA", base_qr.size, (0, 0, 0, 0))
    fg_layer = Image.new("RGBA", base_qr.size, (*fg_rgb, 255))
    qr_matrix.paste(fg_layer, (0, 0), mask=module_mask)

    qr_w, qr_h = qr_matrix.size

    # 4. Create Background Canvas filled with background color
    canvas = Image.new("RGBA", (qr_w, qr_h), (*bg_rgb, 255))

    # 5. Apply Watermark Image (Full Cover edge-to-edge)
    if watermark_image:
        try:
            if "," in watermark_image:
                _, b64_data = watermark_image.split(",", 1)
            else:
                b64_data = watermark_image

            img_bytes = base64.b64decode(b64_data)
            wm_img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")

            if watermark_style == "center":
                # Center emblem badge
                target_size = int(min(qr_w, qr_h) * 0.24)
                wm_img.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)
                ww, wh = wm_img.size
                pad = 10
                bx = (qr_w - ww - pad * 2) // 2
                by = (qr_h - wh - pad * 2) // 2
                draw_badge = ImageDraw.Draw(canvas)
                draw_badge.rounded_rectangle(
                    [bx, by, bx + ww + pad * 2, by + wh + pad * 2],
                    radius=12,
                    fill=(*bg_rgb, 255),
                    outline=(*fg_rgb, 255),
                    width=2
                )
                canvas.paste(wm_img, (bx + pad, by + pad), mask=wm_img)
            else:
                # FULL COVER: Fits the entire (qr_w, qr_h) edge to edge!
                full_cover_img = ImageOps.fit(wm_img, (qr_w, qr_h), Image.Resampling.LANCZOS)
                r, g, b, a = full_cover_img.split()
                a = a.point(lambda p: int(p * watermark_opacity))
                full_cover_img.putalpha(a)
                canvas.paste(full_cover_img, (0, 0), mask=full_cover_img)
        except Exception as e:
            app.logger.warning(f"Failed to process watermark image: {e}")

    # 6. Apply Watermark Text (Full Cover Tiled Pattern across the entire QR code)
    if watermark_text:
        try:
            wm_rgb = hex_to_rgb(watermark_text_color)
            alpha_int = int(255 * watermark_opacity)

            # Generate full cover repeating watermark pattern spanning across the entire QR code
            txt_layer_size = int(max(qr_w, qr_h) * 1.6)
            txt_canvas = Image.new("RGBA", (txt_layer_size, txt_layer_size), (0, 0, 0, 0))
            draw_txt = ImageDraw.Draw(txt_canvas)

            char_count = len(watermark_text)
            font_size = 32 if char_count <= 8 else (26 if char_count <= 15 else 20)
            # Scale font proportionally to output size
            scale_factor = output_size / 1024
            font_size = max(10, int(font_size * scale_factor))
            font = get_truetype_font(font_size)

            bbox = draw_txt.textbbox((0, 0), watermark_text, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]

            step_x = max(120, tw + 45)
            step_y = max(55, th + 35)

            # Tile across the entire canvas
            row_idx = 0
            for y in range(-step_y, txt_layer_size + step_y, step_y):
                offset = (step_x // 2) if (row_idx % 2 == 1) else 0
                for x in range(-step_x, txt_layer_size + step_x, step_x):
                    draw_txt.text((x + offset, y), watermark_text, fill=(*wm_rgb, alpha_int), font=font)
                row_idx += 1

            # Rotate text 25 degrees for dynamic full-cover diagonal watermark
            rotated_txt = txt_canvas.rotate(25, resample=Image.Resampling.BICUBIC)
            rw, rh = rotated_txt.size

            rx = (qr_w - rw) // 2
            ry = (qr_h - rh) // 2
            canvas.paste(rotated_txt, (rx, ry), mask=rotated_txt)
        except Exception as e:
            app.logger.warning(f"Failed to draw watermark text: {e}")

    # 7. Composite QR Matrix over the watermarked background canvas
    final_qr = Image.alpha_composite(canvas, qr_matrix)

    # 8. Add Bottom Banner if provided
    if bottom_text:
        try:
            banner_height = 46
            banner_canvas = Image.new("RGBA", (qr_w, qr_h + banner_height), (*bg_rgb, 255))
            banner_canvas.paste(final_qr, (0, 0))

            draw = ImageDraw.Draw(banner_canvas)
            banner_font = get_truetype_font(16)
            bbox = draw.textbbox((0, 0), bottom_text, font=banner_font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]

            pill_w = text_w + 34
            pill_h = 28
            pill_x = (qr_w - pill_w) // 2
            pill_y = qr_h + (banner_height - pill_h) // 2

            draw.rounded_rectangle(
                [pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
                radius=14,
                fill=bottom_bg_color
            )

            text_x = (qr_w - text_w) // 2
            text_y = pill_y + (pill_h - text_h) // 2 - 1
            draw.text((text_x, text_y), bottom_text, fill=bottom_text_color, font=banner_font)

            final_qr = banner_canvas
        except Exception as e:
            app.logger.warning(f"Failed to add bottom banner: {e}")

    return final_qr.convert("RGB")


def create_qr_svg(text, foreground, background):
    """Generate an SVG QR code and return SVG bytes."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=10,
        border=4,
        image_factory=qrcode.image.svg.SvgFillImage,
    )
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill_color=foreground, back_color=background)
    buf = io.BytesIO()
    img.save(buf)
    return buf.getvalue()


@app.route("/")
def index():
    """Render the main application UI."""
    return render_template("index.html")


@app.route("/api/generate", methods=["POST"])
def generate_qr():
    """Generate a QR code and return a Base64-encoded PNG data URL."""
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON payload."}), 400

        (
            text,
            foreground,
            background,
            watermark_image,
            watermark_text,
            watermark_text_color,
            watermark_opacity,
            watermark_style,
            bottom_text,
            bottom_text_color,
            bottom_bg_color,
            output_size,
        ) = validate_and_extract_payload(data)

        # Generate in-memory image
        img = create_qr_image(
            text,
            foreground,
            background,
            watermark_image=watermark_image,
            watermark_text=watermark_text,
            watermark_text_color=watermark_text_color,
            watermark_opacity=watermark_opacity,
            watermark_style=watermark_style,
            bottom_text=bottom_text,
            bottom_text_color=bottom_text_color,
            bottom_bg_color=bottom_bg_color,
            output_size=output_size,
        )
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        encoded_image = base64.b64encode(buffer.getvalue()).decode("utf-8")
        data_url = f"data:image/png;base64,{encoded_image}"

        return jsonify({
            "image": data_url,
            "filename": "qr-code.png"
        }), 200

    except ValueError as val_err:
        return jsonify({"error": str(val_err)}), 400
    except Exception as exc:
        app.logger.error(f"Error during QR generation: {exc}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500


@app.route("/api/download", methods=["POST"])
def download_qr():
    """Generate and return a downloadable PNG file attachment without disk persistence."""
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON payload."}), 400

        (
            text,
            foreground,
            background,
            watermark_image,
            watermark_text,
            watermark_text_color,
            watermark_opacity,
            watermark_style,
            bottom_text,
            bottom_text_color,
            bottom_bg_color,
            output_size,
        ) = validate_and_extract_payload(data)

        # Generate in-memory image
        img = create_qr_image(
            text,
            foreground,
            background,
            watermark_image=watermark_image,
            watermark_text=watermark_text,
            watermark_text_color=watermark_text_color,
            watermark_opacity=watermark_opacity,
            watermark_style=watermark_style,
            bottom_text=bottom_text,
            bottom_text_color=bottom_text_color,
            bottom_bg_color=bottom_bg_color,
            output_size=output_size,
        )
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype="image/png",
            as_attachment=True,
            download_name="qr-code.png"
        )

    except ValueError as val_err:
        return jsonify({"error": str(val_err)}), 400
    except Exception as exc:
        app.logger.error(f"Error during QR download: {exc}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500


@app.route("/api/download-svg", methods=["POST"])
def download_svg():
    """Generate and return a downloadable SVG QR code."""
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON payload."}), 400

        text = data.get("text", "").strip()
        if not text:
            return jsonify({"error": "Please enter a URL or text."}), 400
        if len(text) > MAX_TEXT_LENGTH:
            return jsonify({"error": f"Input text too long (max {MAX_TEXT_LENGTH} chars)."}), 400

        foreground = data.get("foreground", DEFAULT_FOREGROUND).strip()
        if not HEX_COLOR_REGEX.match(foreground):
            foreground = DEFAULT_FOREGROUND

        background = data.get("background", DEFAULT_BACKGROUND).strip()
        if not HEX_COLOR_REGEX.match(background):
            background = DEFAULT_BACKGROUND

        svg_bytes = create_qr_svg(text, foreground, background)
        buf = io.BytesIO(svg_bytes)
        buf.seek(0)

        return send_file(
            buf,
            mimetype="image/svg+xml",
            as_attachment=True,
            download_name="qr-code.svg"
        )

    except Exception as exc:
        app.logger.error(f"Error during SVG generation: {exc}")
        return jsonify({"error": "Something went wrong generating SVG."}), 500


@app.route("/api/decode", methods=["POST"])
def decode_qr():
    """Decode a QR code image uploaded as Base64 and return the decoded text."""
    if not PYZBAR_AVAILABLE:
        return jsonify({"error": "QR decode library (pyzbar) is not installed. Run: pip install pyzbar"}), 503

    try:
        data = request.get_json(silent=True)
        if not data or not data.get("image"):
            return jsonify({"error": "No image data provided."}), 400

        image_data = data["image"]
        if "," in image_data:
            _, b64_data = image_data.split(",", 1)
        else:
            b64_data = image_data

        img_bytes = base64.b64decode(b64_data)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        decoded = pyzbar.decode(img)
        if not decoded:
            return jsonify({"error": "No QR code found in the uploaded image. Try a clearer image."}), 404

        results = []
        for d in decoded:
            results.append({
                "data": d.data.decode("utf-8", errors="replace"),
                "type": d.type,
            })

        return jsonify({"results": results}), 200

    except Exception as exc:
        app.logger.error(f"Error during QR decode: {exc}")
        return jsonify({"error": "Failed to decode the image. Please try a different file."}), 500


@app.route("/api/batch", methods=["POST"])
def batch_generate():
    """Generate multiple QR codes from a list of texts and return a ZIP file."""
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON payload."}), 400

        entries = data.get("entries", [])
        if not isinstance(entries, list) or not entries:
            return jsonify({"error": "Please provide a list of entries."}), 400
        if len(entries) > 50:
            return jsonify({"error": "Batch limit is 50 QR codes per request."}), 400

        # Common style options
        foreground = data.get("foreground", DEFAULT_FOREGROUND).strip()
        if not HEX_COLOR_REGEX.match(foreground):
            foreground = DEFAULT_FOREGROUND

        background = data.get("background", DEFAULT_BACKGROUND).strip()
        if not HEX_COLOR_REGEX.match(background):
            background = DEFAULT_BACKGROUND

        output_size = int(data.get("output_size", 512))
        if output_size not in VALID_SIZES:
            output_size = 512

        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for idx, entry in enumerate(entries):
                text = str(entry).strip() if isinstance(entry, (str, int, float)) else ""
                if not text or len(text) > MAX_TEXT_LENGTH:
                    continue
                try:
                    img = create_qr_image(
                        text,
                        foreground,
                        background,
                        output_size=output_size,
                    )
                    img_buf = io.BytesIO()
                    img.save(img_buf, format="PNG")
                    safe_name = re.sub(r'[^\w\-.]', '_', text[:30])
                    filename = f"qr_{idx+1:02d}_{safe_name}.png"
                    zf.writestr(filename, img_buf.getvalue())
                except Exception as e:
                    app.logger.warning(f"Skipping entry {idx}: {e}")

        zip_buf.seek(0)
        return send_file(
            zip_buf,
            mimetype="application/zip",
            as_attachment=True,
            download_name="qr-codes-batch.zip"
        )

    except Exception as exc:
        app.logger.error(f"Error during batch generation: {exc}")
        return jsonify({"error": "Something went wrong during batch generation."}), 500


@app.errorhandler(404)
def not_found_handler(e):
    return jsonify({"error": "Resource not found."}), 404


@app.errorhandler(500)
def server_error_handler(e):
    return jsonify({"error": "Internal server error occurred. Please try again."}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

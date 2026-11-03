"""Renderiza cada <section class="post"> de un HTML a PNG 1080x1350 y los guarda también como JPEG (lo que exige Instagram).

Uso:
    python render_pieza.py carrusel_mitos.html out/mitos
"""
import os
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
html = os.path.join(HERE, sys.argv[1])
out = os.path.join(HERE, sys.argv[2])
os.makedirs(out, exist_ok=True)
url = "file:///" + html.replace("\\", "/").replace(" ", "%20")

with sync_playwright() as pw:
    browser = pw.chromium.launch(args=["--force-color-profile=srgb", "--font-render-hinting=none"])
    page = browser.new_page(viewport={"width": 1200, "height": 1500}, device_scale_factor=1)
    page.goto(url)
    page.wait_for_load_state("networkidle")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(1000)
    for el in page.query_selector_all(".post"):
        name = el.get_attribute("id")
        png = os.path.join(out, f"{name}.png")
        el.screenshot(path=png)
        Image.open(png).convert("RGB").save(os.path.join(out, f"{name}.jpg"), "JPEG", quality=95, subsampling=0)
        print(name, flush=True)
    browser.close()

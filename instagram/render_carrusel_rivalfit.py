"""Renderiza cada <section class="post"> de carrusel_rivalfit.html a PNG 1080x1350 (4:5).

Uso:
    python render_carrusel_rivalfit.py
"""
import os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'rivalfit')
URL = 'file:///' + os.path.join(HERE, 'carrusel_rivalfit.html').replace('\\', '/').replace(' ', '%20')


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--force-color-profile=srgb', '--font-render-hinting=none'])
        page = browser.new_page(viewport={'width': 1200, 'height': 1500}, device_scale_factor=1)
        page.goto(URL)
        page.wait_for_function('window.READY === true', timeout=60000)
        page.wait_for_load_state('networkidle')
        for el in page.query_selector_all('.post'):
            name = el.get_attribute('id') + '.png'
            el.screenshot(path=os.path.join(OUT, name))
            print(name, flush=True)
        browser.close()


if __name__ == '__main__':
    main()

"""Renderiza cada <section class="post"> de posts.html a PNG 1080x1350 y monta una vista previa del grid.

Uso:
    python render.py
"""
import os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
URL = 'file:///' + os.path.join(HERE, 'posts.html').replace('\\', '/').replace(' ', '%20')

GRID = """<body style="margin:0;background:#000;width:1080px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
%s</body>"""


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--force-color-profile=srgb', '--font-render-hinting=none'])
        page = browser.new_page(viewport={'width': 1200, 'height': 1500}, device_scale_factor=1)
        page.goto(URL)
        page.wait_for_function('window.READY === true', timeout=60000)
        page.wait_for_load_state('networkidle')
        names = []
        for el in page.query_selector_all('.post'):
            name = el.get_attribute('id') + '.png'
            el.screenshot(path=os.path.join(OUT, name))
            if 'cover' not in el.get_attribute('class'):
                names.append(name)
            print(name, flush=True)
        # Vista previa del perfil: miniaturas 3:4 con recorte centrado, como el grid de Instagram
        cells = ''.join(
            f'<div style="aspect-ratio:3/4;background:url({n}) center/cover"></div>' for n in names)
        grid = os.path.join(OUT, '_grid.html')
        with open(grid, 'w', encoding='utf-8') as f:
            f.write(GRID % cells)
        page.set_viewport_size({'width': 1080, 'height': 960})
        page.goto('file:///' + grid.replace('\\', '/').replace(' ', '%20'))
        page.screenshot(path=os.path.join(OUT, 'grid_preview.png'), full_page=True)
        os.remove(grid)
        browser.close()


if __name__ == '__main__':
    main()

"""Renderiza frames de index.html con Playwright (timeline determinista via window.seek).

Uso:
    python render.py <frame_inicio> <frame_fin> <carpeta_salida>      # rango de frames a 60 fps
    python render.py --stills <carpeta_salida> 1.2 5.5 9 ...          # capturas sueltas (segundos)
"""
import os
import sys
from playwright.sync_api import sync_playwright

FPS = 60
HERE = os.path.dirname(os.path.abspath(__file__))
# --vertical (en cualquier posición) renderiza el formato 9:16 a 1080x1920
VERTICAL = '--vertical' in sys.argv
if VERTICAL:
    sys.argv.remove('--vertical')
SIZE = {'width': 1080, 'height': 1920} if VERTICAL else {'width': 1920, 'height': 1080}
URL = 'file:///' + os.path.join(HERE, 'index.html').replace('\\', '/').replace(' ', '%20') + ('#render-v' if VERTICAL else '#render')


def main():
    stills = sys.argv[1] == '--stills'
    out = sys.argv[2] if stills else sys.argv[3]
    os.makedirs(out, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--force-color-profile=srgb', '--font-render-hinting=none'])
        page = browser.new_page(viewport=SIZE, device_scale_factor=1)
        page.on('pageerror', lambda e: print('PAGEERROR', e, flush=True))
        page.goto(URL)
        page.wait_for_function('window.READY === true', timeout=60000)
        if stills:
            for s in sys.argv[3:]:
                page.evaluate(f'seek({float(s)})')
                page.screenshot(path=os.path.join(out, f's_{float(s):05.2f}.jpg'), type='jpeg', quality=80)
        else:
            a, b = int(sys.argv[1]), int(sys.argv[2])
            for f in range(a, b):
                page.evaluate(f'seek({f / FPS})')
                page.screenshot(path=os.path.join(out, f'f{f:05d}.jpg'), type='jpeg', quality=97)
                if f % 100 == 0:
                    print('frame', f, flush=True)
        browser.close()


if __name__ == '__main__':
    main()

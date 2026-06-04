import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = Path(__file__).parent / "img"

PROJECTS = [
    ("rivalfit.app",    "https://rivalfit.app",                                               "screenshot_rivalfit.jpg"),
    ("milucandco",      "https://milucandco.vercel.app/",                                     "screenshot_milu.jpg"),
    ("elianisromero",   "https://elianisromero.vercel.app/",                                  "screenshot_elianis.jpg"),
    ("fabianzambrano",  "https://fabianzambrano.vercel.app/",                                 "screenshot_fabian.jpg"),
    ("retail-analysis", "https://github.com/jesusgomez-data/retail-sales-data-analysis",      "screenshot_retail.jpg"),
]

async def capture(page, url, name, out):
    sys.stdout.write(f"  Capturando {name}...\n"); sys.stdout.flush()
    try:
        await page.goto(url, wait_until="networkidle", timeout=35000)
        await asyncio.sleep(2)
        await page.screenshot(
            path=str(out),
            clip={"x": 0, "y": 0, "width": 1440, "height": 900},
            type="jpeg", quality=92,
        )
        sz = out.stat().st_size // 1024
        sys.stdout.write(f"    OK: {out.name} ({sz} KB)\n"); sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(f"    FAIL: {e}\n"); sys.stdout.flush()

async def main():
    sys.stdout.write("=== Screenshot Capture ===\n"); sys.stdout.flush()
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = await ctx.new_page()
        for name, url, filename in PROJECTS:
            await capture(page, url, name, BASE / filename)
        await browser.close()
    sys.stdout.write("Listo.\n"); sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(main())

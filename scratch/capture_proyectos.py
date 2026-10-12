import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    out_dir = r"C:\Users\jesus\.gemini\antigravity\brain\1281dd4e-d01c-4ffa-a2c4-cf1d85e83444"
    cwd = os.path.abspath(".").replace("\\", "/")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        await page.goto(f"file:///{cwd}/proyectos.html", wait_until="networkidle")
        await page.evaluate("""() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.remove();
            const cookie = document.getElementById('cookie-banner');
            if (cookie) cookie.remove();
            document.body.style.overflow = 'auto';
        }""")
        await asyncio.sleep(1)
        
        await page.screenshot(
            path=os.path.join(out_dir, "redesign_proyectos.png"),
            full_page=False
        )
        print("Captured redesign_proyectos.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

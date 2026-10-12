import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    out_dir = r"C:\Users\jesus\.gemini\antigravity\brain\1281dd4e-d01c-4ffa-a2c4-cf1d85e83444"
    cwd = os.path.abspath(".")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        # Load index.html
        index_path = f"file:///{cwd}/index.html".replace("\\", "/")
        await page.goto(index_path, wait_until="networkidle")
        
        # Remove preloader and cookie banner if present
        await page.evaluate("""() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.remove();
            const cookie = document.getElementById('cookie-banner');
            if (cookie) cookie.remove();
            document.body.style.overflow = 'auto';
        }""")
        await asyncio.sleep(1)
        
        # 1. Capture Quiz Diagnostic section
        quiz_el = await page.query_selector("#express-quiz")
        if quiz_el:
            await quiz_el.scroll_into_view_if_needed()
            await asyncio.sleep(0.5)
            await page.screenshot(
                path=os.path.join(out_dir, "redesign_quiz.png"),
                clip=await quiz_el.bounding_box()
            )
            print("Captured redesign_quiz.png")
            
        # 2. Capture Pricing section
        pricing_el = await page.query_selector("#precios")
        if pricing_el:
            await pricing_el.scroll_into_view_if_needed()
            await asyncio.sleep(0.5)
            await page.screenshot(
                path=os.path.join(out_dir, "redesign_pricing.png"),
                clip=await pricing_el.bounding_box()
            )
            print("Captured redesign_pricing.png")

        # 3. Capture Footer
        footer_el = await page.query_selector(".site-footer")
        if footer_el:
            await footer_el.scroll_into_view_if_needed()
            await asyncio.sleep(0.5)
            await page.screenshot(
                path=os.path.join(out_dir, "redesign_footer.png"),
                clip=await footer_el.bounding_box()
            )
            print("Captured redesign_footer.png")
            
        # 4. Load proyectos.html
        proyectos_path = f"file:///{cwd}/proyectos.html".replace("\\", "/")
        await page.goto(proyectos_path, wait_until="networkidle")
        await page.evaluate("""() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.remove();
            const cookie = document.getElementById('cookie-banner');
            if (cookie) cookie.remove();
            document.body.style.overflow = 'auto';
        }""")
        await asyncio.sleep(1)
        
        # Capture Proyectos toolbar & first cards
        toolbar_el = await page.query_selector(".showcase-header")
        if toolbar_el:
            await toolbar_el.scroll_into_view_if_needed()
            await asyncio.sleep(0.5)
            await page.screenshot(
                path=os.path.join(out_dir, "redesign_proyectos.png"),
                full_page=False
            )
            print("Captured redesign_proyectos.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

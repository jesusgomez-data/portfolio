from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:8743/index.html")
    page.wait_for_load_state("networkidle", timeout=15000)
    time.sleep(6)
    page.screenshot(path="ss_hero_full.png", clip={"x":0,"y":0,"width":900,"height":900})
    browser.close()
print("Done")

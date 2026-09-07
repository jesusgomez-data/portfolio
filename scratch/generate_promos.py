import asyncio
from playwright.async_api import async_playwright
import os
import subprocess

async def main():
    scratch_dir = os.path.abspath('scratch')
    os.makedirs(scratch_dir, exist_ok=True)
    out_dir = os.path.abspath('videos promocionales')
    os.makedirs(out_dir, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1080, 'height': 1920})
        page = await context.new_page()
        
        # Promo 1: Calculadora
        path1 = os.path.abspath('scratch/promo_calc.html').replace('\\', '/')
        await page.goto(f'file:///{path1}')
        await page.wait_for_timeout(1000)
        p1_s1 = os.path.join(scratch_dir, 'p1_step1.png')
        await page.screenshot(path=p1_s1)
        
        await page.evaluate('selectOpt(1, "opt1-2")')
        await page.wait_for_timeout(600)
        p1_s1_sel = os.path.join(scratch_dir, 'p1_step1_sel.png')
        await page.screenshot(path=p1_s1_sel)
        
        await page.evaluate('showStep(2)')
        await page.wait_for_timeout(600)
        p1_s2 = os.path.join(scratch_dir, 'p1_step2.png')
        await page.screenshot(path=p1_s2)
        
        await page.evaluate('selectOpt(2, "opt2-2")')
        await page.wait_for_timeout(600)
        p1_s2_sel = os.path.join(scratch_dir, 'p1_step2_sel.png')
        await page.screenshot(path=p1_s2_sel)
        
        await page.evaluate('showStep(3)')
        await page.wait_for_timeout(1000)
        p1_s3 = os.path.join(scratch_dir, 'p1_step3.png')
        await page.screenshot(path=p1_s3)
        
        # Promo 2: Test
        path2 = os.path.abspath('scratch/promo_test.html').replace('\\', '/')
        await page.goto(f'file:///{path2}')
        await page.wait_for_timeout(1000)
        p2_s1 = os.path.join(scratch_dir, 'p2_step1.png')
        await page.screenshot(path=p2_s1)
        
        await page.evaluate('selectOpt(1, "opt1-2")')
        await page.wait_for_timeout(600)
        p2_s1_sel = os.path.join(scratch_dir, 'p2_step1_sel.png')
        await page.screenshot(path=p2_s1_sel)
        
        await page.evaluate('showStep(2)')
        await page.wait_for_timeout(600)
        p2_s2 = os.path.join(scratch_dir, 'p2_step2.png')
        await page.screenshot(path=p2_s2)
        
        await page.evaluate('selectOpt(2, "opt2-1")')
        await page.wait_for_timeout(600)
        p2_s2_sel = os.path.join(scratch_dir, 'p2_step2_sel.png')
        await page.screenshot(path=p2_s2_sel)
        
        await page.evaluate('showStep(3)')
        await page.wait_for_timeout(1000)
        p2_s3 = os.path.join(scratch_dir, 'p2_step3.png')
        await page.screenshot(path=p2_s3)
        
        await browser.close()
        print('Screenshots saved to scratch_dir')

    # Render MP4s with FFmpeg
    v1 = os.path.join(out_dir, 'Calculadora_Presupuestos_Express.mp4')
    v2 = os.path.join(out_dir, 'Test_Friccion_Digital.mp4')
    
    cmd1 = [
        'ffmpeg', '-y',
        '-loop', '1', '-t', '2.5', '-i', p1_s1,
        '-loop', '1', '-t', '1.2', '-i', p1_s1_sel,
        '-loop', '1', '-t', '2.5', '-i', p1_s2,
        '-loop', '1', '-t', '1.2', '-i', p1_s2_sel,
        '-loop', '1', '-t', '4.5', '-i', p1_s3,
        '-filter_complex', '[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[v]',
        '-map', '[v]',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30',
        v1
    ]
    
    cmd2 = [
        'ffmpeg', '-y',
        '-loop', '1', '-t', '2.5', '-i', p2_s1,
        '-loop', '1', '-t', '1.2', '-i', p2_s1_sel,
        '-loop', '1', '-t', '2.5', '-i', p2_s2,
        '-loop', '1', '-t', '1.2', '-i', p2_s2_sel,
        '-loop', '1', '-t', '4.5', '-i', p2_s3,
        '-filter_complex', '[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[v]',
        '-map', '[v]',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30',
        v2
    ]
    
    subprocess.run(cmd1, check=True)
    subprocess.run(cmd2, check=True)
    print('Videos rendered successfully!')

if __name__ == '__main__':
    asyncio.run(main())

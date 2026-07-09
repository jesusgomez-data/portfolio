import numpy as np
from PIL import Image

def remove_black_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    data = np.array(img)
    visited = np.zeros((height, width), dtype=bool)
    
    # Border pixels as starting queue
    queue = []
    for x in range(width):
        queue.append((0, x))
        queue.append((height-1, x))
    for y in range(height):
        queue.append((y, 0))
        queue.append((y, width-1))
        
    for r, c in queue:
        visited[r, c] = True
        
    # Helper to check if a pixel is dark enough to be background
    # The uploaded image background is solid black, so checking R,G,B < 35 is safe
    def is_bg(color):
        r, g, b, a = color
        return r < 35 and g < 35 and b < 35
        
    bg_mask = np.zeros((height, width), dtype=bool)
    
    head = 0
    while head < len(queue):
        r, c = queue[head]
        head += 1
        
        color = data[r, c]
        if is_bg(color):
            bg_mask[r, c] = True
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < height and 0 <= nc < width:
                    if not visited[nr, nc]:
                        visited[nr, nc] = True
                        n_color = data[nr, nc]
                        if is_bg(n_color):
                            queue.append((nr, nc))
                            
    # Make background pixels transparent
    data[bg_mask, 3] = 0
    
    # Save as PNG
    new_img = Image.fromarray(data)
    new_img.save(output_path, "PNG")
    print(f"Transparency applied successfully. Saved to {output_path}")

if __name__ == "__main__":
    remove_black_background(
        r"c:\Users\jesus\Documents\AntiGravity\Portfolio\img\assistant_mini.jpg",
        r"c:\Users\jesus\Documents\AntiGravity\Portfolio\img\assistant_mini.png"
    )

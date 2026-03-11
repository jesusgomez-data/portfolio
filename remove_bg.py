from PIL import Image
import numpy as np

def remove_checkerboard(input_path, output_path):
    # Abrir imagen y convertir a RGBA
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Separar canales
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # El patrón de cuadros suele ser gris (R~=G~=B) y blanco (R,G,B altos)
    # Buscamos píxeles donde la diferencia entre R, G y B sea pequeña (neutros)
    diff_rg = np.abs(r.astype(int) - g.astype(int))
    diff_gb = np.abs(g.astype(int) - b.astype(int))
    diff_rb = np.abs(r.astype(int) - b.astype(int))
    
    # Umbral para considerar un color como "neutro" (gris/blanco)
    threshold = 20 
    is_neutral = (diff_rg < threshold) & (diff_gb < threshold) & (diff_rb < threshold)
    
    # También podemos considerar la luminosidad para asegurar que los colores neones se mantengan
    # Los neones tienen canales dominantes.
    
    # Aplicar transparencia a los neutros
    data[is_neutral, 3] = 0
    
    # Guardar resultado
    new_img = Image.fromarray(data)
    new_img.save(output_path, "PNG")

if __name__ == "__main__":
    input_img = r"C:\Users\jesus\.gemini\antigravity\brain\331978c1-7314-4cd7-8a95-82f4c60c0776\uploaded_image_1768993460561.jpg"
    output_img = r"c:\Users\jesus\Documents\AntiGravity\Portfolio\img\logo.png"
    remove_checkerboard(input_img, output_img)
    print("Logo procesado y guardado con éxito.")

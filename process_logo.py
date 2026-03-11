from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # Si el píxel es muy oscuro (fondo negro), hacerlo transparente
        # Usamos un umbral pequeño para capturar negros no perfectos
        if item[0] < 30 and item[1] < 30 and item[2] < 30:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    make_transparent(r"c:\Users\jesus\Documents\AntiGravity\Portfolio\img\logo_red.png", 
                     r"c:\Users\jesus\Documents\AntiGravity\Portfolio\img\logo_final_no_bg.png")
    print("Fondo eliminado con éxito.")

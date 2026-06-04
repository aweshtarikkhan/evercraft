import os
from PIL import Image

src_path = r"C:\Users\awesh\Downloads\EverCraft Publications logo\EverCraft Publications logo\Favicon Icon.png"
dest_ico = r"c:\Users\awesh\Desktop\EverCraft Publications - new pub\public\favicon.ico"
dest_png = r"c:\Users\awesh\Desktop\EverCraft Publications - new pub\public\favicon.png"

try:
    print("Opening source image...")
    img = Image.open(src_path)
    
    # Save as ICO (standard multiple sizes)
    print("Saving ICO file...")
    img.save(dest_ico, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    
    # Save as optimized PNG
    print("Saving PNG file...")
    img_png = img.resize((64, 64), Image.Resampling.LANCZOS)
    img_png.save(dest_png, format="PNG")
    
    print("SUCCESS: Favicon optimized and saved successfully!")
except Exception as e:
    print(f"ERROR: {str(e)}")

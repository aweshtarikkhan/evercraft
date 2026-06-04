import os
from PIL import Image

src1 = r"C:\Users\awesh\Downloads\EverCraft Publications logo\EverCraft Publications logo\Logo 1.png"
src2 = r"C:\Users\awesh\Downloads\EverCraft Publications logo\EverCraft Publications logo\Logo 2.png"
dest1 = r"c:\Users\awesh\Desktop\EverCraft Publications - new pub\public\Images\Evercraft Logo 1.png"
dest2 = r"c:\Users\awesh\Desktop\EverCraft Publications - new pub\public\Images\Evercraft Logo 2.png"

def optimize_logo(src, dest):
    try:
        print(f"Optimizing {src}...")
        img = Image.open(src)
        # Resize to width 600 while maintaining aspect ratio
        w_percent = (600 / float(img.size[0]))
        h_size = int((float(img.size[1]) * float(w_percent)))
        img_resized = img.resize((600, h_size), Image.Resampling.LANCZOS)
        img_resized.save(dest, format="PNG", optimize=True)
        print(f"Saved to {dest}")
    except Exception as e:
        print(f"ERROR for {src}: {str(e)}")

optimize_logo(src1, dest1)
optimize_logo(src2, dest2)

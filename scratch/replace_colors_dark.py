import os

src_dir = r"c:\Users\awesh\Desktop\EverCraft Publications\frontend\src"

replacements = [
    # Global containers background
    ('background: "#FAF5EF"', 'background: "#121212"'),
    ("background: '#FAF5EF'", "background: '#121212'"),
    ('background: "#ffffff"', 'background: "#1C1917"'),
    ("background: '#ffffff'", "background: '#1C1917'"),
    ('background: "#fff"', 'background: "#1C1917"'),
    ("background: '#fff'", "background: '#1C1917'"),
    ('bgColor="#FAF5EF"', 'bgColor="#121212"'),
    ('bgColor="#ffffff"', 'bgColor="#1C1917"'),

    # Text colors
    ('color: "#730000"', 'color: "#FAF5EF"'),
    ("color: '#730000'", "color: '#FAF5EF'"),
    ('color: "#5C3A21"', 'color: "#E5E7EB"'),
    ("color: '#5C3A21'", "color: '#E5E7EB'"),
    ('color: "#5b1616"', 'color: "#FAF5EF"'),
    ("color: '#5b1616'", "color: '#FAF5EF'"),
    ('color: "#1c1917"', 'color: "#FAF5EF"'),
    ("color: '#1c1917'", "color: '#FAF5EF'"),
    ('color: "#4b5563"', 'color: "#D1D5DB"'),
    ("color: '#4b5563'", "color: '#D1D5DB'"),
    ('color: "#aa7c11"', 'color: "#D4AF37"'),
    ("color: '#aa7c11'", "color: '#D4AF37'"),

    # Borders
    ('#fde68a', 'rgba(212, 175, 55, 0.3)'),
    ('border: "1.5px solid rgba(91, 22, 22, 0.2)"', 'border: "1.5px solid rgba(212, 175, 55, 0.25)"'),
    ('border: "1.5px solid rgba(91, 22, 22, 0.08)"', 'border: "1.5px solid rgba(212, 175, 55, 0.15)"'),
    ('border: "1.5px solid rgba(115, 0, 0, 0.2)"', 'border: "1.5px solid rgba(212, 175, 55, 0.25)"'),
    ('border: "1px solid rgba(115, 0, 0, 0.2)"', 'border: "1px solid rgba(212, 175, 55, 0.25)"'),
    ('border: "1.5px solid rgba(115, 0, 0, 0.08)"', 'border: "1.5px solid rgba(212, 175, 55, 0.15)"'),
    ('borderTop: "1px solid #FAF5EF"', 'borderTop: "1px solid rgba(212, 175, 55, 0.1)"'),
    ('borderBottom: "1px solid #FAF5EF"', 'borderBottom: "1px solid rgba(212, 175, 55, 0.1)"'),
    ('borderTop: "1px solid #fef3c7"', 'borderTop: "1px solid rgba(212, 175, 55, 0.1)"'),
    ('border: "1px solid #e5e7eb"', 'border: "1px solid rgba(212, 175, 55, 0.2)"'),
    ('border: "1.5px solid #e5e7eb"', 'border: "1.5px solid rgba(212, 175, 55, 0.25)"'),

    # Specific overlays and details
    ('background: "rgba(250, 245, 239, 0.96)"', 'background: "rgba(18, 18, 18, 0.95)"'),
    ('background: "radial-gradient(circle at center, #FDF4E5 0%, #FAF5EF 70%)"', 'background: "radial-gradient(circle at center, #1C1917 0%, #121212 70%)"'),
    ('background: "radial-gradient(circle at 30% 50%, #73000022, transparent 60%)"', 'background: "radial-gradient(circle at 30% 50%, rgba(115, 0, 0, 0.15), transparent 60%)"'),
    ('background: "radial-gradient(circle, rgba(240,227,208,0.7) 0%, rgba(250,245,239,0) 70%)"', 'background: "radial-gradient(circle, rgba(28,25,23,0.8) 0%, rgba(18,18,18,0) 70%)"'),
    ('background: "#fffbeb"', 'background: "#1C1917"'),
    ('background: "#FAF5EF", border: "2px dashed #D4AF37"', 'background: "#121212", border: "2px dashed #D4AF37"'),
    ('background: "#FAF5EF", border: "1px solid rgba(212, 175, 55, 0.2)"', 'background: "#121212", border: "1px solid rgba(212, 175, 55, 0.2)"'),
    ('background: "rgba(180,83,9,0.15)", border: "1px solid rgba(180,83,9,0.3)"', 'background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)"'),

    # Testimonials Test Cards
    ('background: "#4A1212"', 'background: "rgba(28,25,23,0.5)"'),
    ('background: "#FAF5EF", color: "#D4AF37"', 'background: "#121212", color: "#D4AF37"'),
    ('background: "#FAF5EF", color: "#FAF5EF"', 'background: "#121212", color: "#FAF5EF"'),
    ('background: "#FAF5EF", color: "#E5E7EB"', 'background: "#121212", color: "#E5E7EB"'),
    ('background: "#730000", color: "#D4AF37"', 'background: "#1C1917", color: "#D4AF37"'),
    
    # Navbar Brand title "EverCraft" text color on dark navbar
    ('color: "#730000", lineHeight: 1.05', 'color: "#FAF5EF", lineHeight: 1.05'),
    
    # Bookcover/Badge background in list/detail
    ('background: "#730000", color: "#D4AF37", border: "1px solid #D4AF37"', 'background: "#D4AF37", color: "#121212", border: "none"'),
]

updated_files = []

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                new_content = content
                for old, new in replacements:
                    new_content = new_content.replace(old, new)
                
                if content != new_content:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    updated_files.append(file_path)
                    print(f"Updated: {file_path}")
            except Exception as e:
                print(f"Error reading/writing {file_path}: {e}")

print(f"Done! Updated {len(updated_files)} files.")

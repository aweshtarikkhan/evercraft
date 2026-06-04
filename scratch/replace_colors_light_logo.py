import os

src_dir = r"c:\Users\awesh\Desktop\EverCraft Publications\frontend\src"

replacements = [
    # Global containers background (restoring light cream theme)
    ('background: "#121212"', 'background: "#FAF5EF"'),
    ("background: '#121212'", "background: '#FAF5EF'"),
    ('background: "#1C1917"', 'background: "#ffffff"'),
    ("background: '#1C1917'", "background: '#ffffff'"),
    ('bgColor="#121212"', 'bgColor="#FAF5EF"'),
    ('bgColor="#1C1917"', 'bgColor="#ffffff"'),

    # Text colors (restoring burgundy text on cream background)
    ('color: "#FAF5EF"', 'color: "#730000"'),
    ("color: '#FAF5EF'", "color: '#FAF5EF'"),
    ('color: "#E5E7EB"', 'color: "#5C3A21"'),
    ("color: '#E5E7EB'", "color: '#5C3A21'"),
    ('color: "#D1D5DB"', 'color: "#4b5563"'),
    ("color: '#D1D5DB'", "color: '#4b5563'"),
    ('color: "#D4AF37"', 'color: "#730000"'),  # Note: headings back to burgundy
    ("color: '#D4AF37'", "color: '#730000'"),

    # Borders
    ('border: "1.5px solid rgba(212, 175, 55, 0.25)"', 'border: "1.5px solid rgba(115, 0, 0, 0.2)"'),
    ('border: "1.5px solid rgba(212, 175, 55, 0.15)"', 'border: "1.5px solid rgba(115, 0, 0, 0.08)"'),
    ('border: "1px solid rgba(212, 175, 55, 0.25)"', 'border: "1px solid rgba(115, 0, 0, 0.2)"'),
    ('borderTop: "1px solid rgba(212, 175, 55, 0.1)"', 'borderTop: "1px solid #FAF5EF"'),
    ('borderBottom: "1px solid rgba(212, 175, 55, 0.1)"', 'borderBottom: "1px solid #FAF5EF"'),
    ('border: "1px solid rgba(212, 175, 55, 0.2)"', 'border: "1px solid #e5e7eb"'),
    ('border: "1.5px solid rgba(212, 175, 55, 0.25)"', 'border: "1.5px solid #e5e7eb"'),

    # Specific overlays
    ('background: "rgba(18, 18, 18, 0.95)"', 'background: "rgba(250, 245, 239, 0.96)"'),
    ('background: "radial-gradient(circle at center, #1C1917 0%, #121212 70%)"', 'background: "radial-gradient(circle at center, #FDF4E5 0%, #FAF5EF 70%)"'),
    ('background: "radial-gradient(circle at 30% 50%, rgba(115, 0, 0, 0.15), transparent 60%)"', 'background: "radial-gradient(circle at 30% 50%, #73000022, transparent 60%)"'),
    ('background: "radial-gradient(circle, rgba(28,25,23,0.8) 0%, rgba(18,18,18,0) 70%)"', 'background: "radial-gradient(circle, rgba(240,227,208,0.7) 0%, rgba(250,245,239,0) 70%)"'),
    ('background: "#121212", border: "2px dashed #D4AF37"', 'background: "#FAF5EF", border: "2px dashed #D4AF37"'),
    ('background: "#121212", border: "1px solid rgba(212, 175, 55, 0.2)"', 'background: "#FAF5EF", border: "1px solid #fde68a"'),
    ('background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)"', 'background: "rgba(180,83,9,0.15)", border: "1px solid rgba(180,83,9,0.3)"'),
]

updated_files = []

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            file_path = os.path.join(root, file)
            # Skip HomePage.tsx because we will manually write its hero section
            if file == "HomePage.tsx":
                continue
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

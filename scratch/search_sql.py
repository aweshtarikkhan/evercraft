with open("evercraft.sql", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

sundarkand_lines = []
for idx, line in enumerate(lines):
    if "Sundarkand" in line:
        sundarkand_lines.append((idx + 1, line))

print(f"Found {len(sundarkand_lines)} occurrences of 'Sundarkand' in evercraft.sql:")
for idx, line in sundarkand_lines:
    safe_line = line[:150].encode('ascii', 'backslashreplace').decode('ascii')
    print(f"Line {idx}: {safe_line}")

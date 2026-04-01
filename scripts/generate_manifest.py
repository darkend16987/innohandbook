import json
from pathlib import Path

# Thứ tự cố định
files = ['Bia01.jpg', 'TableContent.jpg'] + [f'page_{i:03d}.jpg' for i in range(1, 32)]

manifest = []
for i, f in enumerate(files):
    manifest.append({
        "page": i + 1,
        "url": f"/pages/{f}",
        "filename": f
    })

with open("public/pages_manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print(f"Generated manifest for {len(manifest)} pages.")

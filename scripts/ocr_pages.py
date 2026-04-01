import google.generativeai as genai
import json, os, sys
from pathlib import Path

PAGES_DIR = Path("public/pages")
OUTPUT_FILE = Path("public/search_index.json")

# Sử dụng API Key của người dùng
api_key = "AIzaSyAiWdDrrGYifrh9d22678_KrwwPNDyD98g"
genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-pro")

PROMPT = """Trích xuất toàn bộ văn bản từ trang thư mục này. 
Trả về JSON với format (chỉ trả về JSON hợp lệ, KHÔNG có markdown ```json ... ```, KHÔNG có text ở ngoài):
{"text": "toàn bộ text trong trang", "keywords": ["từ khóa chính 1", "từ khóa chính 2"]}"""

# Thứ tự chuẩn
files = ['Bia01.jpg', 'TableContent.jpg'] + [f'page_{i:03d}.jpg' for i in range(1, 32)]

search_index = []
for idx, filename in enumerate(files):
    filepath = PAGES_DIR / filename
    page_num = idx + 1
    print(f"Processing page {page_num}/{len(files)}: {filename}")
    
    if not filepath.exists():
        print(f"  --> File {filepath} not found, skipping...")
        continue

    with open(filepath, "rb") as f:
        image_bytes = f.read()

    try:
        response = model.generate_content([
            {"mime_type": "image/jpeg", "data": image_bytes},
            PROMPT
        ])
        
        raw = response.text.strip()
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.endswith("```"):
            raw = raw[:-3]
            
        data = json.loads(raw)

        search_index.append({
            "page": page_num,
            "filename": filename,
            "text": data.get("text", ""),
            "keywords": data.get("keywords", [])
        })
    except Exception as e:
        print(f"  Lỗi trang {page_num}: {e}")
        search_index.append({
            "page": page_num,
            "filename": filename,
            "text": "",
            "keywords": []
        })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(search_index, f, ensure_ascii=False, indent=2)

print(f"\n✅ Done!")

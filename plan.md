# INNO Digital Handbook — Flipbook Ebook
## Project Plan

**Mục tiêu**: Chuyển đổi sổ tay nhân viên INNO (dạng ảnh từ Photoshop) thành một ebook digital với tính năng flip page, điều hướng mục lục, và tìm kiếm full-text.

**Môi trường triển khai**: Vercel (frontend) + Firebase (storage + database)  
**Thời gian ước tính**: 4–5 ngày làm việc  
**Chi phí ước tính**: ~$0 (trong giới hạn free tier)

---

## Tech Stack

| Layer | Công nghệ | Lý do chọn |
|---|---|---|
| Flip engine | [StPageFlip](https://github.com/Nodlik/StPageFlip) + [react-pageflip](https://github.com/Nodlik/react-pageflip) | Đẹp nhất hiện tại, TypeScript, MIT license |
| Frontend framework | Next.js (React) | Dễ deploy Vercel, SSG cho performance |
| OCR | Google Gemini Vision API | Tiếng Việt chuẩn, rẻ (~$0.10/lần chạy) |
| Image storage | Firebase Storage | Free 5GB, CDN sẵn |
| Search index | Firestore hoặc JSON tĩnh | Đơn giản, không cần backend |
| Hosting | Vercel | Free tier, CI/CD tự động từ GitHub |

---

## Cấu trúc thư mục dự án

```
inno-handbook/
├── public/
│   ├── pages/               ← Ảnh các trang (page_001.jpg ...)
│   └── search_index.json    ← OCR output (hoặc fetch từ Firestore)
├── src/
│   ├── components/
│   │   ├── FlipBook.jsx     ← StPageFlip wrapper
│   │   ├── SearchBar.jsx    ← Tìm kiếm + highlight + jump
│   │   └── TableOfContents.jsx ← Mục lục click → trang
│   ├── pages/
│   │   └── index.js         ← Main page
│   └── styles/
│       └── globals.css
├── scripts/
│   └── ocr_pages.py         ← Script chạy Gemini OCR (1 lần)
├── .env.local               ← Firebase + Gemini API keys
└── package.json
```

---

## Phase 0 — Chuẩn bị Assets
**Thời gian**: 1–2 giờ  
**Input**: File PSD gốc  
**Output**: Thư mục `public/pages/` chứa ảnh từng trang

### Bước 0.1 — Export ảnh từ Photoshop

1. Mở file PSD gốc trong Photoshop
2. Vào **File → Export → Export As** (hoặc "Save for Web")
3. Chọn format **JPEG**, quality **85–90%**
4. Resolution: **150 dpi** (đủ cho web, không quá nặng)
5. Export toàn bộ trang, đặt tên theo pattern: `page_001.jpg`, `page_002.jpg`, ...

> ⚠️ **Lưu ý đặt tên**: Dùng số có leading zero (001, 002...) thay vì (1, 2...) để sort đúng thứ tự. Nếu có hơn 99 trang thì dùng 3 chữ số.

### Bước 0.2 — Tối ưu dung lượng (tùy chọn)

Nếu ảnh quá nặng (> 500KB/trang), có thể dùng tool nén:
```bash
# Dùng ImageMagick để resize + nén hàng loạt
mogrify -resize 1240x1754 -quality 85 public/pages/*.jpg
```
Kích thước đề xuất: **1240×1754px** (A4 portrait, 150dpi)

### Checklist Phase 0
- [ ] Tất cả trang đã export thành JPEG
- [ ] Đặt tên đúng pattern `page_001.jpg`
- [ ] Dung lượng mỗi ảnh < 500KB
- [ ] Tổng dung lượng thư mục < 100MB (an toàn cho free tier)

---

## Phase 1 — OCR với Gemini Vision
**Thời gian**: 2–4 giờ (viết script + chạy + kiểm tra)  
**Input**: Thư mục `public/pages/`  
**Output**: File `public/search_index.json`

### Bước 1.1 — Cài đặt môi trường Python

```bash
pip install google-generativeai pillow
```

Tạo file `.env` chứa API key:
```
GEMINI_API_KEY=your_api_key_here
```

Lấy API key miễn phí tại: https://aistudio.google.com/app/apikey

### Bước 1.2 — Script OCR (`scripts/ocr_pages.py`)

```python
import google.generativeai as genai
import json, os, base64
from pathlib import Path

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

PAGES_DIR = Path("public/pages")
OUTPUT_FILE = Path("public/search_index.json")

PROMPT = """Trích xuất toàn bộ văn bản từ trang tài liệu này.
Trả về JSON với format sau (KHÔNG có markdown, KHÔNG có backtick):
{"text": "toàn bộ text trong trang", "keywords": ["từ khóa chính 1", "từ khóa chính 2"]}"""

search_index = []
page_files = sorted(PAGES_DIR.glob("*.jpg"))

for idx, filepath in enumerate(page_files):
    page_num = idx + 1
    print(f"Processing page {page_num}/{len(page_files)}: {filepath.name}")

    with open(filepath, "rb") as f:
        image_bytes = f.read()

    try:
        response = model.generate_content([
            {"mime_type": "image/jpeg", "data": image_bytes},
            PROMPT
        ])

        raw = response.text.strip()
        data = json.loads(raw)

        search_index.append({
            "page": page_num,
            "filename": filepath.name,
            "text": data.get("text", ""),
            "keywords": data.get("keywords", [])
        })
    except Exception as e:
        print(f"  ⚠️  Lỗi trang {page_num}: {e}")
        search_index.append({
            "page": page_num,
            "filename": filepath.name,
            "text": "",
            "keywords": []
        })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(search_index, f, ensure_ascii=False, indent=2)

print(f"\n✅ Done! Đã xử lý {len(search_index)} trang → {OUTPUT_FILE}")
```

### Bước 1.3 — Chạy script

```bash
cd inno-handbook
python scripts/ocr_pages.py
```

### Bước 1.4 — Kiểm tra kết quả

Mở `public/search_index.json`, kiểm tra một vài trang xem text có đúng không, đặc biệt các tên riêng và số liệu quan trọng.

### Checklist Phase 1
- [ ] Script chạy không lỗi
- [ ] `search_index.json` có đủ số trang
- [ ] Text tiếng Việt nhận dạng đúng
- [ ] Kiểm tra thủ công ít nhất 5 trang ngẫu nhiên

---

## Phase 2 — Firebase Setup
**Thời gian**: 2–3 giờ  
**Input**: Thư mục ảnh + search_index.json  
**Output**: Firebase project sẵn sàng phục vụ ảnh qua CDN

### Bước 2.1 — Tạo Firebase project

1. Vào https://console.firebase.google.com
2. Tạo project mới: `inno-handbook`
3. Bật **Firebase Storage** (chọn region `asia-southeast1` — Singapore, gần VN nhất)
4. Bật **Firestore Database** (chế độ production, sau đó chỉnh rules)

### Bước 2.2 — Upload ảnh lên Firebase Storage

Cách nhanh nhất: Dùng Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init storage

# Upload toàn bộ ảnh
firebase deploy --only storage
```

Hoặc upload thủ công qua Firebase Console nếu số trang ít (< 50 trang).

Sau khi upload, cấu trúc Storage sẽ là:
```
gs://inno-handbook.appspot.com/
└── pages/
    ├── page_001.jpg
    ├── page_002.jpg
    └── ...
```

### Bước 2.3 — Cấu hình Storage Rules (public read)

Trong Firebase Console → Storage → Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pages/{allPaths=**} {
      allow read: if true;   // Public read cho ảnh trang
      allow write: if false; // Không cho ghi từ client
    }
  }
}
```

### Bước 2.4 — Generate file manifest URL

Chạy script nhỏ để tạo `pages_manifest.json` chứa danh sách URL ảnh:

```python
# scripts/generate_manifest.py
import json
from pathlib import Path

BASE_URL = "https://firebasestorage.googleapis.com/v0/b/inno-handbook.appspot.com/o/pages%2F"
SUFFIX = "?alt=media"

pages = sorted(Path("public/pages").glob("*.jpg"))
manifest = [
    {
        "page": i + 1,
        "url": f"{BASE_URL}{p.name}{SUFFIX}"
    }
    for i, p in enumerate(pages)
]

with open("public/pages_manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)

print(f"✅ Generated manifest for {len(manifest)} pages")
```

> 💡 **Thay thế đơn giản hơn**: Nếu không muốn dùng Firebase Storage, đặt thư mục `pages/` thẳng vào `public/` của Next.js và serve trực tiếp từ Vercel. Phù hợp nếu tổng dung lượng < 100MB.

### Checklist Phase 2
- [ ] Firebase project đã tạo
- [ ] Ảnh upload thành công lên Storage
- [ ] Storage rules đã set public read
- [ ] `pages_manifest.json` có đúng URL cho tất cả trang
- [ ] Test thử 1 URL ảnh trên browser — hiển thị được

---

## Phase 3 — Frontend Development
**Thời gian**: 2–3 ngày  
**Input**: `pages_manifest.json` + `search_index.json`  
**Output**: Web app hoàn chỉnh chạy local, sẵn sàng deploy

### Bước 3.1 — Khởi tạo dự án Next.js

```bash
npx create-next-app@latest inno-handbook --js --tailwind --no-app
cd inno-handbook
npm install react-pageflip
```

### Bước 3.2 — Component FlipBook (`src/components/FlipBook.jsx`)

Core component tích hợp StPageFlip:

```jsx
import { forwardRef } from 'react'
import HTMLFlipBook from 'react-pageflip'

const Page = forwardRef(({ url, pageNum }, ref) => (
  <div ref={ref} className="page bg-white shadow">
    <img src={url} alt={`Trang ${pageNum}`} className="w-full h-full object-contain" />
    <div className="absolute bottom-2 right-3 text-xs text-gray-400">{pageNum}</div>
  </div>
))
Page.displayName = 'Page'

export default function FlipBook({ pages, onPageChange, flipRef }) {
  return (
    <HTMLFlipBook
      ref={flipRef}
      width={595}
      height={842}
      size="stretch"
      minWidth={300}
      maxWidth={800}
      showCover={true}
      mobileScrollSupport={true}
      onFlip={(e) => onPageChange(e.data + 1)}
      className="mx-auto"
    >
      {pages.map((p) => (
        <Page key={p.page} url={p.url} pageNum={p.page} />
      ))}
    </HTMLFlipBook>
  )
}
```

### Bước 3.3 — Component SearchBar (`src/components/SearchBar.jsx`)

```jsx
import { useState } from 'react'

export default function SearchBar({ searchIndex, onJumpToPage }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  function handleSearch(q) {
    setQuery(q)
    if (!q.trim()) return setResults([])

    const found = searchIndex
      .filter(p => p.text.toLowerCase().includes(q.toLowerCase()))
      .map(p => ({
        page: p.page,
        preview: p.text
          .substring(
            p.text.toLowerCase().indexOf(q.toLowerCase()) - 30,
            p.text.toLowerCase().indexOf(q.toLowerCase()) + 80
          ).trim()
      }))
      .slice(0, 10)

    setResults(found)
  }

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        placeholder="Tìm kiếm trong sổ tay..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg text-sm"
      />
      {results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.page}
              onClick={() => { onJumpToPage(r.page); setResults([]) }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-0"
            >
              <span className="text-xs font-semibold text-red-600">Trang {r.page}</span>
              <p className="text-xs text-gray-600 truncate mt-0.5">...{r.preview}...</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Bước 3.4 — Component TableOfContents (`src/components/TableOfContents.jsx`)

Mục lục được định nghĩa thủ công dựa trên file PDF gốc (xem mục lục `Bìa_2.pdf`):

```jsx
// Chỉnh TOC_DATA theo nội dung thực tế của sổ tay INNO
const TOC_DATA = [
  { title: "A. Chào mừng bạn đến với INNO", page: 3, level: 1 },
  { title: "1. Về chúng tôi", page: 4, level: 2 },
  { title: "2. Cơ cấu tổ chức", page: 6, level: 2 },
  { title: "3. Trụ sở INNO", page: 8, level: 2 },
  { title: "B. Các quy định", page: 10, level: 1 },
  { title: "1. Giờ làm và chấm công", page: 11, level: 2 },
  { title: "2. Làm thêm giờ (OT)", page: 14, level: 2 },
  { title: "3. Nghỉ phép - Nghỉ lễ", page: 16, level: 2 },
  { title: "4. Trả lương - Bảo hiểm - Phúc lợi", page: 19, level: 2 },
  { title: "5. Nghỉ phép - Nghỉ lễ - Nghỉ việc", page: 22, level: 2 },
  { title: "6. Văn hóa - Tác phong", page: 25, level: 2 },
  { title: "7. An toàn - Tài sản - Bảo mật", page: 28, level: 2 },
  { title: "8. Kỷ luật", page: 31, level: 2 },
  { title: "9. Quy trình thử việc - tiếp nhận", page: 34, level: 2 },
  { title: "10. Quy trình thuyên chuyển nội bộ", page: 37, level: 2 },
  { title: "C. Quy định các khoản chi", page: 40, level: 1 },
  { title: "1. Sử dụng xe công ty - taxi", page: 41, level: 2 },
  { title: "2. Công tác phí - vé máy bay - khách sạn", page: 43, level: 2 },
  { title: "3. Công tác nước ngoài - đoàn đông", page: 46, level: 2 },
]

export default function TableOfContents({ onJumpToPage, currentPage }) {
  return (
    <nav className="p-4">
      <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3">Mục lục</h2>
      <ul className="space-y-1">
        {TOC_DATA.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => onJumpToPage(item.page)}
              className={`w-full text-left text-sm py-1 px-2 rounded transition-colors
                ${item.level === 1 ? 'font-semibold' : 'pl-5 text-gray-600'}
                ${currentPage === item.page ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'}
              `}
            >
              <span className="mr-2 text-gray-400 text-xs">{item.page}</span>
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

### Bước 3.5 — Main Page (`src/pages/index.js`)

```jsx
import { useRef, useState } from 'react'
import FlipBook from '@/components/FlipBook'
import SearchBar from '@/components/SearchBar'
import TableOfContents from '@/components/TableOfContents'
import pagesManifest from '../../public/pages_manifest.json'
import searchIndex from '../../public/search_index.json'

export default function Home() {
  const flipRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showToc, setShowToc] = useState(false)

  function jumpToPage(pageNum) {
    flipRef.current?.pageFlip().flip(pageNum - 1)
    setShowToc(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-red-700 text-white px-4 py-3 flex items-center gap-4 shadow">
        <button onClick={() => setShowToc(!showToc)} className="p-1 hover:bg-red-600 rounded">
          ☰
        </button>
        <h1 className="font-bold text-sm flex-1">Sổ tay Nhân viên INNO</h1>
        <SearchBar searchIndex={searchIndex} onJumpToPage={jumpToPage} />
        <span className="text-xs opacity-70">Trang {currentPage}</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* TOC Sidebar */}
        {showToc && (
          <aside className="w-64 bg-white border-r overflow-y-auto shrink-0">
            <TableOfContents onJumpToPage={jumpToPage} currentPage={currentPage} />
          </aside>
        )}

        {/* Flipbook */}
        <main className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <FlipBook
            pages={pagesManifest}
            onPageChange={setCurrentPage}
            flipRef={flipRef}
          />
        </main>
      </div>

      {/* Navigation controls */}
      <footer className="bg-white border-t px-4 py-2 flex items-center justify-center gap-6">
        <button onClick={() => jumpToPage(1)} className="text-sm text-gray-500 hover:text-gray-800">⏮ Đầu</button>
        <button onClick={() => flipRef.current?.pageFlip().flipPrev()} className="px-4 py-1 bg-gray-100 rounded hover:bg-gray-200">← Trước</button>
        <span className="text-sm text-gray-600 min-w-24 text-center">Trang {currentPage} / {pagesManifest.length}</span>
        <button onClick={() => flipRef.current?.pageFlip().flipNext()} className="px-4 py-1 bg-gray-100 rounded hover:bg-gray-200">Sau →</button>
        <button onClick={() => jumpToPage(pagesManifest.length)} className="text-sm text-gray-500 hover:text-gray-800">Cuối ⏭</button>
      </footer>
    </div>
  )
}
```

### Checklist Phase 3
- [ ] `npm run dev` chạy không lỗi
- [ ] Flip page hoạt động mượt (cả desktop + mobile)
- [ ] Search tìm được text, click nhảy đúng trang
- [ ] TOC click đúng trang
- [ ] Navigation buttons hoạt động
- [ ] Test trên mobile (responsive)

---

## Phase 4 — Deploy lên Vercel
**Thời gian**: 1–2 giờ

### Bước 4.1 — Push code lên GitHub

```bash
git init
git add .
git commit -m "feat: INNO Digital Handbook v1.0"
git remote add origin https://github.com/your-org/inno-handbook.git
git push -u origin main
```

### Bước 4.2 — Connect Vercel

1. Vào https://vercel.com → **New Project**
2. Import repository GitHub vừa tạo
3. Framework: **Next.js** (tự nhận diện)
4. Thêm Environment Variables nếu cần (Firebase config)
5. Click **Deploy**

Sau ~2 phút sẽ có URL dạng: `https://inno-handbook.vercel.app`

### Bước 4.3 — Custom domain (tùy chọn)

Nếu muốn URL đẹp hơn như `handbook.innojsc.com`:
1. Vercel → Settings → Domains → Add `handbook.innojsc.com`
2. Thêm CNAME record vào DNS: `handbook → cname.vercel-dns.com`

### Checklist Phase 4
- [ ] Deploy thành công, không có build error
- [ ] Test URL production trên nhiều trình duyệt
- [ ] Test trên điện thoại Android + iOS
- [ ] Tốc độ load trang đầu < 3 giây
- [ ] Share link cho 1–2 nhân viên test thử

---

## Rủi ro và Giải pháp dự phòng

| Rủi ro | Khả năng | Giải pháp |
|---|---|---|
| OCR nhận dạng sai tiếng Việt | Trung bình | Chỉnh thủ công `search_index.json` sau khi chạy |
| `react-pageflip` lag trên mobile | Thấp | Fallback sang chế độ scroll thông thường |
| Firebase Storage vượt free tier | Rất thấp | Nén ảnh thêm hoặc chuyển sang Vercel static |
| Ảnh trang bị nghiêng/lệch | Trung bình | Chỉnh lại trong Photoshop trước khi export |
| CORS error khi load ảnh Firebase | Thấp | Cấu hình Firebase Storage CORS rules |

---

## Tính năng mở rộng (sau v1.0)

Những tính năng này không cần cho bản đầu, có thể thêm sau:

- **Bookmark**: Lưu trang đang đọc vào localStorage
- **Zoom**: Phóng to trang để đọc chi tiết
- **Dark mode**: Giao diện tối
- **Share link**: URL dạng `?page=15` để chia sẻ đúng trang
- **Analytics**: Theo dõi trang nào được đọc nhiều nhất
- **Password protect**: Yêu cầu đăng nhập (Firebase Auth)
- **Auto-update**: Khi có phiên bản mới, tự động thông báo

---

## Tài liệu tham khảo

- StPageFlip docs: https://nodlik.github.io/StPageFlip/
- react-pageflip: https://nodlik.github.io/react-pageflip/
- Paginis demo (Vercel): https://paginis.vercel.app
- Gemini API key: https://aistudio.google.com/app/apikey
- Firebase Console: https://console.firebase.google.com
- Vercel Dashboard: https://vercel.com/dashboard

---

*Plan v1.0 — INNO Joint Stock Company — Internal use*

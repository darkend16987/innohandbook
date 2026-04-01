import { AlignLeft } from 'lucide-react';

// Using actual physical page mapping. Bia is page 1, TableContent is 2, page_001 is 3.
const TOC_DATA = [
  { title: "Bìa Sổ Tay", page: 1, level: 1 },
  { title: "Mục Lục", page: 2, level: 1 },
  { title: "A. Chào mừng bạn đến với INNO", page: 3, level: 1 },
  { title: "1. Về chúng tôi", page: 4, level: 2 },
  { title: "2. Cơ cấu tổ chức", page: 6, level: 2 },
  { title: "3. Trụ sở INNO", page: 8, level: 2 },
  { title: "B. Các quy định", page: 10, level: 1 },
  { title: "1. Giờ làm và chấm công", page: 11, level: 2 },
  { title: "2. Làm thêm giờ (OT)", page: 14, level: 2 },
  { title: "3. Nghỉ phép - Nghỉ lễ", page: 16, level: 2 },
  { title: "4. Trả lương - Bảo hiểm - Phúc lợi", page: 19, level: 2 },
  { title: "5. Nghỉ việc", page: 22, level: 2 },
  { title: "6. Văn hóa - Tác phong", page: 25, level: 2 },
  { title: "7. An toàn - Tài sản - Bảo mật", page: 28, level: 2 },
  { title: "8. Kỷ luật", page: 31, level: 2 },
];

export default function TableOfContents({ onJumpToPage, currentPage, onClose }) {
  return (
    <nav className="h-full flex flex-col p-4 bg-white/90 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
        <AlignLeft size={20} className="text-red-600" />
        <h2 className="font-bold text-sm uppercase tracking-wide text-gray-800">Mục lục</h2>
      </div>
      <ul className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {TOC_DATA.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => {
                onJumpToPage(item.page);
                if (onClose) onClose();
              }}
              className={`w-full text-left py-2 px-3 rounded-xl transition-all duration-200 flex items-center gap-3
                ${item.level === 1 ? 'font-bold text-gray-800 mt-2 text-[14px]' : 'pl-6 text-gray-600 text-[13.5px]'}
                ${currentPage === item.page 
                  ? 'bg-red-50 text-red-700 shadow-sm border border-red-100 font-semibold' 
                  : 'hover:bg-slate-100 hover:text-red-600'}
              `}
            >
              <div className={`shrink-0 w-6 text-center text-xs ${currentPage === item.page ? 'text-red-500 font-bold' : 'text-gray-400 font-medium'}`}>
                {item.page}
              </div>
              <span className="leading-snug">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

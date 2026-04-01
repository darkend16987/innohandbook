import { AlignLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Index = Printed Page + 2
const TOC_DATA = [
  { title: "Bìa Sổ Tay", page: 1, level: 1 },
  { title: "Mục Lục", page: 2, level: 1 },
  { title: "A. Chào mừng bạn đến với INNO", page: 3, level: 1 },
  { title: "1. Về chúng tôi", page: 4, level: 2 },
  { title: "2. Giá trị văn hóa INNO", page: 5, level: 2 },
  { title: "3. Cơ cấu tổ chức", page: 6, level: 2 },
  { title: "4. Trụ sở INNO", page: 8, level: 2 },
  { title: "B. Các quy định", page: 9, level: 1 },
  { title: "1. Giờ làm và chấm công", page: 9, level: 2 },
  { title: "2. Làm thêm giờ (OT)", page: 12, level: 2 },
  { title: "3. Trả lương - Bảo hiểm - Phúc lợi", page: 13, level: 2 },
  { title: "4. Nghỉ phép - Lễ - Việc", page: 14, level: 2 },
  { title: "5. Sử dụng tòa nhà - Tiện ích", page: 18, level: 2 },
  { title: "6. An toàn - PCCC", page: 21, level: 2 },
  { title: "7. Văn hóa - Tác phong", page: 23, level: 2 },
  { title: "8. An toàn - Tài sản - Bảo mật", page: 24, level: 2 },
  { title: "9. Kỷ luật", page: 25, level: 2 },
  { title: "10. Thử việc - Tiếp nhận", page: 26, level: 2 },
  { title: "11. Thuyên chuyển nội bộ", page: 27, level: 2 },
  { title: "C. Quy định các khoản chi", page: 28, level: 1 },
  { title: "1. Sử dụng xe công ty - taxi", page: 28, level: 2 },
  { title: "2. Phí vé máy bay - khách sạn", page: 30, level: 2 },
  { title: "3. Công tác nước ngoài - đoàn", page: 31, level: 2 },
  { title: "Danh bạ liên hệ", page: 32, level: 1 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function TableOfContents({ onJumpToPage, currentPage, onClose }) {
  return (
    <nav className="h-full flex flex-col p-6 md:p-8 bg-white/95 backdrop-blur-2xl">
      <div className="flex items-center gap-4 mb-8 pb-5 border-b-2 border-slate-100">
        <div className="p-2 bg-red-100 rounded-xl text-red-600">
          <AlignLeft size={24} strokeWidth={3} />
        </div>
        <h2 className="font-extrabold text-base md:text-lg uppercase tracking-widest text-slate-800">Mục lục</h2>
      </div>
      
      <motion.ul 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10"
      >
        {TOC_DATA.map((item, i) => (
          <motion.li key={i} variants={itemVariants}>
            <button
              onClick={() => {
                if (onClose) onClose();
                setTimeout(() => onJumpToPage(item.page), 300);
              }}
              className={`w-full text-left py-3 px-4 rounded-2xl transition-all duration-300 flex items-center gap-3 group
                ${item.level === 1 ? 'mt-6 first:mt-0 font-bold text-slate-800 text-[15px]' : 'pl-6 text-slate-600 font-medium text-[14px]'}
                ${currentPage === item.page 
                  ? 'bg-red-50/80 text-red-600 shadow-sm border border-red-100/50 scale-[1.02]' 
                  : 'hover:bg-slate-100/80 hover:text-red-500 hover:scale-[1.01] hover:pl-5'}
              `}
            >
              <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-xs transition-colors
                ${currentPage === item.page ? 'bg-red-500 text-white font-black shadow-md' : 'bg-slate-100 text-slate-400 font-bold group-hover:bg-red-100 group-hover:text-red-500'}`}>
                {item.page}
              </div>
              <span className="leading-snug flex-1">{item.title}</span>
              
              <ArrowRight size={16} className={`shrink-0 transition-transform duration-300
                ${currentPage === item.page ? 'text-red-500 translate-x-0 opacity-100' : 'text-slate-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </nav>
  );
}

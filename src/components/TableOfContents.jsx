import { AlignLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Using actual physical page mapping
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
    <nav className="h-full flex flex-col p-6 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-100">
        <div className="p-2 bg-red-100 rounded-xl text-red-600">
          <AlignLeft size={20} strokeWidth={3} />
        </div>
        <h2 className="font-extrabold text-sm uppercase tracking-widest text-slate-800">Mục lục</h2>
      </div>
      
      <motion.ul 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10"
      >
        {TOC_DATA.map((item, i) => (
          <motion.li key={i} variants={itemVariants}>
            <button
              onClick={() => {
                onJumpToPage(item.page);
                if (onClose) onClose();
              }}
              className={`w-full text-left py-2.5 px-3 rounded-2xl transition-all duration-300 flex items-center gap-3 group
                ${item.level === 1 ? 'mt-4 first:mt-0 font-bold text-slate-800 text-[14px]' : 'pl-6 text-slate-600 font-medium text-[13.5px]'}
                ${currentPage === item.page 
                  ? 'bg-red-50/80 text-red-600 shadow-sm border border-red-100/50 scale-[1.02]' 
                  : 'hover:bg-slate-100/50 hover:text-red-500 hover:scale-[1.01] hover:pl-4'}
              `}
            >
              <div className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors
                ${currentPage === item.page ? 'bg-red-500 text-white font-black shadow-md' : 'bg-slate-100 text-slate-400 font-bold group-hover:bg-red-100 group-hover:text-red-500'}`}>
                {item.page}
              </div>
              <span className="leading-snug flex-1">{item.title}</span>
              
              <ArrowRight size={14} className={`shrink-0 transition-transform duration-300
                ${currentPage === item.page ? 'text-red-500 translate-x-0 opacity-100' : 'text-slate-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </nav>
  );
}

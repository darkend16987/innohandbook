import { useState, useEffect, useRef } from 'react';
import { Search, X, Pointer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar({ searchIndex, onJumpToPage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(q) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    if (!searchIndex) return;

    const found = searchIndex
      .filter(p => p.text && p.text.toLowerCase().includes(q.toLowerCase()))
      .map(p => {
        const idx = p.text.toLowerCase().indexOf(q.toLowerCase());
        const start = Math.max(0, idx - 40);
        const end = Math.min(p.text.length, idx + 80);
        return {
          page: p.page,
          preview: p.text.substring(start, end).replace(/\n/g, ' '),
        };
      })
      .slice(0, 8); // top 8 results

    setResults(found);
    setIsOpen(true);
  }

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
      <div className="relative flex items-center group">
        <Search className="absolute left-4 text-red-400 group-focus-within:text-red-600 transition-colors" size={18} strokeWidth={2.5} />
        <input
          type="text"
          placeholder="Tìm nội dung trong sổ tay..."
          value={query}
          onFocus={() => query.trim() && setIsOpen(true)}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-white/80 border-2 border-transparent backdrop-blur-md rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-red-200/50 focus:border-red-400 focus:bg-white transition-all placeholder:text-gray-400 text-gray-800 hard-shadow hover:bg-white"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }} 
            className="absolute right-3 text-gray-400 hover:text-white hover:bg-red-500 transition-colors bg-gray-100/80 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl z-[100] max-h-[350px] overflow-y-auto custom-scrollbar p-2"
          >
            {results.map((r, i) => (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                key={`${r.page}-${i}`}
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => onJumpToPage(r.page), 250);
                }}
                className="w-full text-left px-5 py-3 hover:bg-red-50 focus:bg-red-50 rounded-2xl transition-colors outline-none group flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black text-red-600 tracking-wider uppercase bg-red-100 w-fit px-2.5 py-1 rounded-md flex items-center gap-1 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    Trang {r.page}
                  </div>
                  <Pointer size={12} className="text-red-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                  ...{r.preview}...
                </p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && query && results.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-md border border-red-100 rounded-3xl shadow-xl z-50 p-8 text-center"
          >
            <div className="text-4xl mb-3 animate-bounce">🙈</div>
            <p className="text-sm font-bold text-slate-700">Trống trơn rồi!</p>
            <p className="text-xs text-slate-500 mt-1">Sổ tay không có nội dung này đâu bạn ơi.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

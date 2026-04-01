import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

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
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-red-400" size={18} />
        <input
          type="text"
          placeholder="Tìm nội dung trong sổ tay..."
          value={query}
          onFocus={() => query.trim() && setIsOpen(true)}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-8 py-2.5 bg-white border-2 border-transparent backdrop-blur-sm rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-red-200 focus:border-red-400 transition-all placeholder:text-gray-400 text-gray-800 hard-shadow"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-100 rounded-full p-0.5">
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-xl border-2 border-red-50 rounded-2xl hard-shadow z-[100] max-h-80 overflow-y-auto custom-scrollbar p-2">
          {results.map((r, i) => (
            <button
              key={`${r.page}-${i}`}
              onClick={() => {
                onJumpToPage(r.page);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-red-50/80 rounded-xl transition-colors border-b border-gray-50 last:border-0 group flex flex-col gap-1"
            >
              <div className="text-[10px] font-bold text-red-600 tracking-wider uppercase bg-red-100/50 w-fit px-2 py-0.5 rounded-md">Trang {r.page}</div>
              <p className="text-xs text-gray-600 leading-relaxed max-h-8 overflow-hidden line-clamp-2">
                ...{r.preview}...
              </p>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full mt-3 w-full bg-white backdrop-blur-md border-2 border-red-50 rounded-2xl hard-shadow z-50 p-6 text-center">
          <p className="text-sm font-medium text-gray-500">Khỉ thật, không tìm thấy kết quả nào!</p>
        </div>
      )}
    </div>
  );
}

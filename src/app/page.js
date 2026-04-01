"use client";

import { useRef, useState, useEffect } from 'react';
import { Menu, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Smile } from 'lucide-react';
import FlipBook from '@/components/FlipBook';
import SearchBar from '@/components/SearchBar';
import TableOfContents from '@/components/TableOfContents';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const flipRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showToc, setShowToc] = useState(false);
  const [pagesManifest, setPagesManifest] = useState([]);
  const [searchIndex, setSearchIndex] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Fetch data asynchronously
    Promise.all([
      fetch('/pages_manifest.json').then(r => r.json()).catch(() => []),
      fetch('/search_index.json').then(r => r.json()).catch(() => [])
    ]).then(([manifest, index]) => {
      setPagesManifest(manifest);
      setSearchIndex(index);
      setIsLoaded(true);
    });
  }, []);

  function jumpToPage(pageNum) {
    if (flipRef.current && flipRef.current.pageFlip()) {
      flipRef.current.pageFlip().flip(pageNum - 1);
    }
  }

  const [dimensions, setDimensions] = useState({ width: 500, height: 700 });
  
  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      if (w < 768) {
        setDimensions({ width: w * 0.9, height: (w * 0.9) * 1.414 });
      } else {
        const targetHeight = h * 0.70;
        const targetWidth = targetHeight / 1.414;
        setDimensions({ width: targetWidth, height: targetHeight });
      }
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Đang tải sổ tay...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundColor: '#ebd9c8',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'
      }}
    >
      
      {/* Playful background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-100 rounded-full blur-[100px] opacity-60 pointer-events-none animate-blob1" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-yellow-100 rounded-full blur-[120px] opacity-50 pointer-events-none animate-blob2" />

      {/* Header */}
      <header className="px-4 md:px-6 py-4 flex items-center justify-between gap-3 z-20 sticky top-0">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => setShowToc(!showToc)} 
            className="p-2.5 bg-white/95 backdrop-blur-md border border-gray-200 text-gray-700 rounded-xl hard-shadow hover:bg-white flex items-center gap-2 group transition-all relative z-50"
          >
            <Menu size={20} className="group-hover:text-red-600 transition-colors" />
            <span className="hidden sm:inline font-bold text-sm">Mục Lục</span>
          </button>
          
          <div className="hidden md:flex items-center gap-3 ml-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl hard-shadow-sm border border-white/50">
            <div className="h-8 md:h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="INNO Logo" className="h-full w-auto object-contain" />
            </div>
            
            <div className="w-px h-10 bg-gray-300/80 mx-2 rotate-12"></div>
            <h2 className="font-bold text-lg text-slate-800 tracking-tight">Sổ tay Nhân viên</h2>
            <Smile size={20} className="text-yellow-500 ml-1" />
          </div>
        </div>

        <div className="flex-[2] md:flex-1 flex justify-center w-full min-w-0 max-w-sm">
          <SearchBar searchIndex={searchIndex} onJumpToPage={jumpToPage} />
        </div>
        
        <div className="flex-1 justify-end gap-3 hidden md:flex">
          <div className="bg-white px-4 py-2 border border-gray-200 rounded-xl hard-shadow flex items-center justify-center font-bold text-sm text-gray-700">
            Trang {currentPage} <span className="text-gray-400 font-normal mx-1">/</span> {pagesManifest.length}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex relative z-10 w-full max-w-7xl mx-auto items-center justify-center px-4">
        
        {/* TOC Sidebar Mobile/Desktop Drawer Overlay */}
        <AnimatePresence>
          {showToc && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              onClick={() => setShowToc(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showToc && (
            <motion.aside 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed top-0 left-0 h-full w-[360px] bg-white border-r border-gray-200 shadow-[20px_0_40px_rgba(0,0,0,0.1)] z-50 shrink-0"
            >
              <TableOfContents onJumpToPage={jumpToPage} currentPage={currentPage} onClose={() => setShowToc(false)} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Flipbook Container */}
        <main className="flex-1 flex items-center justify-center w-full h-full relative z-10 pb-20 md:pb-10 pt-4 md:pt-0">
          {pagesManifest.length > 0 ? (
            <FlipBook
              pages={pagesManifest}
              onPageChange={setCurrentPage}
              flipRef={flipRef}
              width={dimensions.width}
              height={dimensions.height}
            />
          ) : (
            <div className="text-gray-500 font-medium bg-white p-6 rounded-2xl hard-shadow border border-gray-200">Không tìm thấy trang nào. Hãy chạy script generate_manifest.py nhé!</div>
          )}
        </main>
      </div>

      {/* Fixed Bottom Navigation Controls */}
      <div className="fixed bottom-0 left-0 w-full h-32 z-20 group flex items-end justify-center pb-4 md:pb-6 pointer-events-none">
        <footer className="pointer-events-auto flex items-center justify-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-gray-200 shadow-2xl scale-95 md:scale-100 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-300">
          <button 
            onClick={() => jumpToPage(1)} 
            title="Về đầu"
            className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-slate-50 text-gray-500 hover:text-red-600 transition-colors shadow-sm active:translate-y-px"
          >
            <ChevronsLeft size={20} />
          </button>
          <button 
            onClick={() => flipRef.current?.pageFlip().flipPrev()} 
            title="Trang trước"
            className="p-3 bg-red-500 border-2 border-red-600 text-white rounded-xl hover:bg-red-600 active:translate-y-px text-sm font-bold shadow-md transition-all flex items-center gap-1"
          >
            <ChevronLeft size={20} /> <span className="hidden sm:inline">Trước</span>
          </button>
          
          <div className="px-4 font-black text-gray-800 tracking-wider flex items-center justify-center min-w-[3rem] md:hidden">
            {currentPage}
          </div>

          <button 
            onClick={() => flipRef.current?.pageFlip().flipNext()} 
            title="Trang sau"
            className="p-3 bg-red-500 border-2 border-red-600 text-white rounded-xl hover:bg-red-600 active:translate-y-px text-sm font-bold shadow-md transition-all flex items-center gap-1"
          >
            <span className="hidden sm:inline">Sau</span> <ChevronRight size={20} />
          </button>
          <button 
            onClick={() => jumpToPage(pagesManifest.length)} 
            title="Đến cuối"
            className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-slate-50 text-gray-500 hover:text-red-600 transition-colors shadow-sm active:translate-y-px"
          >
            <ChevronsRight size={20} />
          </button>
        </footer>
      </div>
    </div>
  );
}

import React, { forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';

const Page = forwardRef(({ url, pageNum }, ref) => (
  <div ref={ref} className="flip-page relative w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden">
    {/* Nội dung trang là ảnh cuốn sổ */}
    <img 
      src={url} 
      alt={`Trang ${pageNum}`} 
      className="w-full h-full object-contain select-none"
      draggable={false}
    />
    
    {/* Page spine shade cho cảm giác sách 3D - Nửa trái bóng mờ bên phải */}
    {pageNum % 2 === 0 ? (
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
    ) : (
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
    )}
  </div>
));
Page.displayName = 'Page';

const FlipBook = React.memo(({ pages, onPageChange, flipRef, width, height }) => {
  return (
    <div className="flex items-center justify-center w-full h-full perspective-1000">
      <HTMLFlipBook
        ref={flipRef}
        width={width || 550}
        height={height || 780}
        size="stretch"
        minWidth={300}
        maxWidth={700}
        minHeight={400}
        maxHeight={1000}
        showCover={true}
        mobileScrollSupport={true}
        className="shadow-2xl mx-auto rounded-sm group drop-shadow-2xl"
        onFlip={(e) => onPageChange(e.data + 1)}
      >
        {pages.map((p) => (
          <Page key={p.page} url={p.url} pageNum={p.page} />
        ))}
      </HTMLFlipBook>
    </div>
  );
}, (prev, next) => {
  return prev.width === next.width && 
         prev.height === next.height && 
         prev.pages.length === next.pages.length;
});

FlipBook.displayName = 'FlipBook';

export default FlipBook;

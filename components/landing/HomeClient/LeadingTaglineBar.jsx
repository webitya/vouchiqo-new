export const LeadingTaglineBar = () => (
  <div className="w-full bg-[#FFF8EF] select-none border-y border-[#EADBCE] py-3.5 sm:py-4 overflow-hidden">
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-center gap-4">
        {/* Left arrow decorator - hidden on mobile, visible on sm and up */}
        <div className="hidden sm:flex items-center gap-2 flex-grow">
          <div className="flex-1 h-[1.5px] bg-[#007F79]/30 rounded-full" />
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0 text-[#007F79]"
          >
            <path
              d="M0 6H14M14 6L9 1M14 6L9 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Center tagline */}
        <h1 className="text-center font-heading font-bold text-xs sm:text-[13px] text-[#35104A] whitespace-normal sm:whitespace-nowrap shrink-0 leading-relaxed uppercase tracking-wider">
          India&apos;s Leading Offers &amp; Deals Marketplace
        </h1>

        {/* Right arrow decorator - hidden on mobile, visible on sm and up */}
        <div className="hidden sm:flex items-center gap-2 flex-grow">
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0 text-[#007F79]"
          >
            <path
              d="M18 6H4M4 6L9 1M4 6L9 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex-1 h-[1.5px] bg-[#007F79]/30 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export default LeadingTaglineBar;

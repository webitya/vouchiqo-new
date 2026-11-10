"use client";

import Link from "next/link";

/**
 * Related brands carousel/footer section.
 */
export default function RelatedBrands({ relatedBrands, category }) {
  if (relatedBrands.length === 0) return null;

  return (
    <section className="bg-white border-t border-slate-200/90 py-6 sm:py-8 px-2.5 sm:px-4 md:px-5 mt-6 select-none">
      <div className="w-full space-y-4">
        <h3 className="text-base sm:text-lg font-medium text-[#F72853] tracking-tight text-left">
          Related Brands in {category || "Same Category"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
          {relatedBrands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brand/${brand.slug}`}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 hover:border-[#F72853] hover:shadow-[0_4px_16px_rgba(247,40,83,0.12)] flex items-center gap-3 transition-all duration-200 shadow-2xs cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 text-[#F72853] font-medium flex items-center justify-center text-xs flex-shrink-0">
                {brand.businessName?.[0]}
              </div>
              <div className="overflow-hidden">
                <h5 className="font-normal text-xs text-slate-800 group-hover:text-[#F72853] truncate leading-none transition-colors">
                  {brand.businessName}
                </h5>
                <span className="text-[9.5px] text-slate-500 font-normal block mt-1 uppercase tracking-wide">
                  {brand.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

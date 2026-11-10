import { Mail } from "lucide-react";

export const NewsletterSubscription = () => {
  return (
    <section className="bg-[#FFF8EF] border-y border-[#EADBCE] py-4 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between w-full text-left gap-4 select-none font-sans">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#35104A] flex items-center justify-center border border-[#35104A] text-[#FFD166] shrink-0 shadow-sm">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-[#35104A] text-sm leading-tight">
            Subscribe to Best Offers
          </h3>
          <p className="text-[11px] text-[#6B4C82] mt-0.5 font-medium">
            Get the latest &amp; verified offer alerts directly in your inbox.
          </p>
        </div>
      </div>
      <div className="flex w-full md:w-auto max-w-sm gap-2 shrink-0">
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full px-3.5 py-1.5 border border-[#EADBCE] bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007F79] focus:border-[#007F79] text-xs text-[#35104A] font-medium placeholder:text-[#6B4C82]/60 shadow-2xs font-sans"
        />
        <button
          type="button"
          className="bg-[#FF2E63] hover:bg-[#E02253] text-white px-4 py-1.5 rounded-lg text-xs font-heading font-bold whitespace-nowrap transition-colors cursor-pointer border-0 shadow-2xs"
        >
          Subscribe
        </button>
      </div>
    </section>
  );
};

export default NewsletterSubscription;

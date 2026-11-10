import { Mail } from "lucide-react";

export const NewsletterSubscription = () => {
  return (
    <section className="bg-slate-50 border-y border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between w-full text-left gap-4 select-none">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/50 text-blue-600 shrink-0 shadow-sm">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-slate-800 text-sm leading-tight">
            Subscribe to Best Offers
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
            Get the latest &amp; verified offer alerts directly in your inbox.
          </p>
        </div>
      </div>
      <div className="flex w-full md:w-auto max-w-sm gap-2 shrink-0">
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full px-3.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-700 font-normal placeholder:text-slate-400/80 shadow-2xs"
        />
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-normal whitespace-nowrap transition-colors cursor-pointer border-0 shadow-2xs"
        >
          Subscribe
        </button>
      </div>
    </section>
  );
};

export default NewsletterSubscription;

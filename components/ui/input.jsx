import { cn } from "@/lib/utils";

function Input({ className, type, ref, ...props }) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs transition-all duration-150 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-slate-400 hover:border-festival-teal hover:shadow-xs focus-visible:border-festival-teal focus-visible:ring-2 focus-visible:ring-festival-teal/25 focus-visible:shadow-xs focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive md:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

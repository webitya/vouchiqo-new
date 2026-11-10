import { cn } from "@/lib/utils";

function Input({ className, type, ref, ...props }) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border-2 border-blue-300/80 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-[0_2px_6px_rgba(37,99,235,0.08)] transition-all duration-150 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-slate-400 hover:border-blue-400 hover:shadow-[0_3px_10px_rgba(37,99,235,0.14)] focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:shadow-[0_2px_12px_rgba(37,99,235,0.22)] focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive md:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

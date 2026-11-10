import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-lg border-2 border-blue-300/80 bg-white px-3 py-2 text-xs text-slate-900 shadow-[0_2px_6px_rgba(37,99,235,0.08)] transition-all duration-150 outline-none placeholder:text-slate-400 hover:border-blue-400 hover:shadow-[0_3px_10px_rgba(37,99,235,0.14)] focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:shadow-[0_2px_12px_rgba(37,99,235,0.22)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive md:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-lg border border-brand-border bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs transition-all duration-150 outline-none placeholder:text-slate-400 hover:border-festival-teal hover:shadow-xs focus-visible:border-festival-teal focus-visible:ring-2 focus-visible:ring-festival-teal/25 focus-visible:shadow-xs focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive md:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

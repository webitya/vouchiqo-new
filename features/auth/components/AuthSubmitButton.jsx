import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Reusable Submit Button for Auth Forms with built-in loading spinner and disabled state.
 */
export function AuthSubmitButton({
  label,
  loadingLabel,
  isPending,
  className,
}) {
  return (
    <Button
      type="submit"
      disabled={isPending}
      className={cn(
        "w-full bg-[#007F79] hover:bg-[#35104A] active:scale-[0.98] text-white rounded-xl py-2.5 text-sm font-heading font-bold transition-all duration-200 flex items-center justify-center gap-2 border-0 h-auto cursor-pointer shadow-2xs disabled:opacity-50 disabled:pointer-events-none mt-1.5",
        className,
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingLabel || "Please wait..."}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </>
      )}
    </Button>
  );
}

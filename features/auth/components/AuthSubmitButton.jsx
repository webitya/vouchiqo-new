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
        "w-full bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-md py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 border-0 h-auto cursor-pointer shadow-none disabled:opacity-50 disabled:pointer-events-none mt-1",
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

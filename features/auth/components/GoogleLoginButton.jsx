import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Reusable Google Login Button with built-in configurations and toast messages.
 */
export function GoogleLoginButton({ className }) {
  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch("/api/auth/google-check");
      const { isConfigured } = await res.json();

      if (isConfigured) {
        await signIn.social({
          provider: "google",
          callbackURL: "/auth/callback",
        });
      } else {
        toast.error(
          "Google sign-in is not available. Please use email and password.",
        );
      }
    } catch (err) {
      toast.error(err?.message ?? "Google authentication failed.");
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      className={cn(
        "w-full h-10 border border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all shadow-none cursor-pointer",
        className,
      )}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.23 2.673 1.24 6.636l4.026 3.129Z"
        />
        <path
          fill="#FBBC05"
          d="M1.24 6.636A11.954 11.954 0 0 0 0 12c0 1.92.453 3.737 1.24 5.364L5.266 14.23A7.054 7.054 0 0 1 4.91 12c0-1.127.263-2.2.734-3.13L1.24 6.636Z"
        />
        <path
          fill="#4285F4"
          d="M12 24c3.245 0 5.973-1.073 7.964-2.927l-3.864-3A7.064 7.064 0 0 1 12 19.091c-3.69 0-6.809-2.49-7.927-5.86L1.24 17.36A11.996 11.996 0 0 0 12 24Z"
        />
        <path
          fill="#34A853"
          d="M23.52 12.273c0-.818-.073-1.609-.208-2.373H12v4.582h6.473c-.273 1.455-1.09 2.69-2.318 3.518l3.864 3c2.255-2.082 3.5-5.155 3.5-8.727Z"
        />
      </svg>
      <span>Google</span>
    </Button>
  );
}

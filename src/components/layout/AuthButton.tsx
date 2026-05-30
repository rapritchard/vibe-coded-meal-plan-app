import { useState } from "react";
import { LogIn, LogOut, User } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { LoginModal } from "@/features/auth/LoginModal";
import { cn } from "@/lib/utils";

interface AuthButtonProps {
  /**
   * Visual treatment. `dark` is tuned for the dark hero band; `light` is
   * tuned for the sticky mobile top bar.
   */
  variant?: "dark" | "light";
}

const VARIANT_STYLES = {
  dark: {
    loading: "text-stone-400",
    emailPill: "text-stone-300 bg-stone-800",
    signOutButton: "text-stone-400 hover:text-white",
    signIn:
      "bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white",
  },
  light: {
    loading: "text-muted-foreground",
    emailPill: "text-stone-700 bg-stone-100",
    signOutButton: "text-muted-foreground hover:text-foreground",
    signIn:
      "bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-foreground",
  },
} as const;

export function AuthButton({ variant = "dark" }: AuthButtonProps) {
  const { email, signOut, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const styles = VARIANT_STYLES[variant];

  if (loading) {
    return <span className={cn("text-xs px-3 py-1.5", styles.loading)}>…</span>;
  }

  if (email) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full",
            styles.emailPill,
          )}
        >
          <User className="h-3 w-3" />
          <span className="hidden sm:inline">{email}</span>
        </span>
        <button
          onClick={signOut}
          className={cn(
            "p-1.5 transition-colors",
            styles.signOutButton,
          )}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors",
          styles.signIn,
        )}
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </button>
      <LoginModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

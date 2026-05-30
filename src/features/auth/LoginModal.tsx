import { useState, type FormEvent } from "react";
import { Mail, Check, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { signInWithMagicLink, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus({ kind: "sending" });
    const error = await signInWithMagicLink(email.trim());
    if (error) {
      setStatus({ kind: "error", message: error });
    } else {
      setStatus({ kind: "sent" });
    }
  }

  function reset() {
    setEmail("");
    setStatus({ kind: "idle" });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif">Sign in</DialogTitle>
          <DialogDescription>
            We&rsquo;ll email you a magic link. Click it and you&rsquo;re in —
            no password needed.
          </DialogDescription>
        </DialogHeader>

        {!configured && (
          <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              Supabase isn&rsquo;t configured. Set{" "}
              <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in your environment.
            </div>
          </div>
        )}

        {status.kind === "sent" ? (
          <div className="flex gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-900">
            <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Check your inbox</div>
              <div className="text-xs mt-1 leading-relaxed">
                We sent a magic link to{" "}
                <span className="font-medium">{email}</span>. The link expires
                in 1 hour.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-9"
                disabled={status.kind === "sending" || !configured}
                required
                autoFocus
              />
            </div>

            {status.kind === "error" && (
              <div className="flex gap-2 p-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-900">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>{status.message}</div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                status.kind === "sending" || !email.trim() || !configured
              }
            >
              {status.kind === "sending" ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

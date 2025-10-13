"use client";

import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        toast({ title: "Login successful!" });
        router.push("/admin/products");
      } else {
        const { error } = await res.json();
        toast({
          title: "Login failed",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[ADMIN_LOGIN]", error);
      toast({
        title: "An error occurred",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "mt-1 block w-full rounded-md border border-[var(--color-neutral-200)] bg-white " +
    "px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-800"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

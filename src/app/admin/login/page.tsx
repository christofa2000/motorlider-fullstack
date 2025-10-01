"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      router.push("/admin/products");
    } else {
      const data = await response.json();
      setError(data.error || "Invalid password");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[var(--color-neutral-200)] rounded-xl p-5 shadow-sm w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Admin Login</h1>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full focus:ring-[var(--color-accent)]"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button type="submit" className="btn btn-primary w-full mt-4">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
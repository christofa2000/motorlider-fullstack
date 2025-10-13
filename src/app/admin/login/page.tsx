import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-neutral-200)] bg-gray-800 p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Admin Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}

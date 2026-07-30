import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Ana sayfa
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Giriş yap</h1>
        <LoginForm />
        <p className="text-sm text-neutral-500 mt-6 text-center">
          Hesabın yok mu?{" "}
          <Link href="/signup" className="text-neutral-900 font-medium hover:underline">
            Mağaza oluştur
          </Link>
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { SignupForm } from "@/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex-1 flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Ana sayfa
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Mağazanı kur</h1>
        <SignupForm />
        <p className="text-sm text-neutral-500 mt-6 text-center">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="text-neutral-900 font-medium hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex-1 bg-neutral-950 text-white">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <span className="text-xl font-bold tracking-tight">oscarshouse</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="hover:underline">
            Giriş yap
          </Link>
          <Link
            href="/signup"
            className="bg-white text-neutral-900 px-4 py-2 rounded-full font-medium hover:bg-neutral-200"
          >
            Ücretsiz başla
          </Link>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-24">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Kendi online mağazanı <span className="text-neutral-400">dakikalar içinde</span> aç
        </h1>
        <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
          Ürünlerini listele, sepet ve ödeme akışını kur, temanı seç — Shopify ve Ticimax&apos;ın
          sunduğu deneyimi kendi markanla, kendi alt alan adınla yayına al.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-white text-neutral-900 hover:bg-neutral-200 px-8 py-3 rounded-full font-semibold text-lg"
          >
            Mağazanı ücretsiz kur
          </Link>
          <Link
            href="/store/demo"
            className="border border-neutral-700 hover:border-neutral-500 px-8 py-3 rounded-full font-semibold text-lg"
          >
            Demo mağazayı gör
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-6 px-6 pb-24">
        {[
          {
            title: "Ürün & Stok Yönetimi",
            desc: "Kategoriler, ürün varyantları, stok takibi — hepsi tek panelde.",
          },
          {
            title: "Sepet & Ödeme",
            desc: "Müşterileriniz sepete ekler, adres girer, siparişi tamamlar.",
          },
          {
            title: "Tema & Çoklu Dil",
            desc: "Mağazanızın rengini, para birimini ve dilini istediğiniz gibi ayarlayın.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-neutral-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

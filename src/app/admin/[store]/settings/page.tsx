import { requireOwnedStore } from "@/lib/guards";
import { updateStoreSettingsAction } from "@/actions/catalog";
import { SettingsForm } from "@/components/forms/SettingsForm";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);
  const action = updateStoreSettingsAction.bind(null, store);

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Mağaza ayarları</h1>
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <SettingsForm action={action} store={storeRecord} />
      </div>
    </main>
  );
}

export default async function DossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <h1 className="text-2xl font-semibold">Dossier {id}</h1>;
}

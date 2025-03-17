import UgovorPrikaz from '@/components/UgovorPrikaz';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <UgovorPrikaz ugovorId={Number(params.id)} />
    </div>
  );
}
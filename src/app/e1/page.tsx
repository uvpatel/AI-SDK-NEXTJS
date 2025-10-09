import Chat from '@/components/Chat';

export default async function Page() {
  // Simulate a delay to show loading.tsx
  await new Promise((r) => setTimeout(r, 2000));

  return (
    <div className="p-10">
      <h1 className="mb-4 text-2xl font-bold">AI Chat</h1>
      <Chat />
    </div>
  );
}

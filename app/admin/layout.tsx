export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Admin pages handle their own layout since login doesn't need sidebar */}
      {children}
    </div>
  );
}


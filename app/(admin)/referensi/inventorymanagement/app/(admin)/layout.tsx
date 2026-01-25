export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ margin: 0, padding: 0 }}>
      {children}
    </section>
  );
}

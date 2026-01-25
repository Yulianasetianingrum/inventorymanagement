export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
      {children}
    </section>
  );
}

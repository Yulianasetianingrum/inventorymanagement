import { Card } from "@/components/ui/card";
import Link from "next/link";

const sample = [
  { id: "PCK-001", status: "OPEN" },
  { id: "PCK-002", status: "IN_PROGRESS" },
];

export default function WorkerPicklistsPage() {
  return (
    <Card>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem" }}>Picklists</h1>
      <ul style={{ display: "grid", gap: "0.5rem" }}>
        {sample.map((item) => (
          <li key={item.id}>
            <Link href={`/worker/picklists/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              {item.id} - {item.status}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

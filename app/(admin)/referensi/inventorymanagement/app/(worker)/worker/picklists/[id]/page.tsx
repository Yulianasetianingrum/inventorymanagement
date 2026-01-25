import { Card } from "@/components/ui/card";

type PageProps = {
  params: { id: string };
};

export default function WorkerPicklistDetailPage({ params }: PageProps) {
  return (
    <Card>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem" }}>
        Picklist {params.id}
      </h1>
      <p style={{ color: "#6b7280" }}>Detail placeholder untuk picklist {params.id}.</p>
    </Card>
  );
}

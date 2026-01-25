import { Card } from "@/components/ui/card";

type PageProps = {
  params: { picklistId: string };
};

export default function HandoverPage({ params }: PageProps) {
  return (
    <Card>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Handover {params.picklistId}
      </h1>
      <p style={{ color: "#6b7280" }}>Konfirmasi handover untuk picklist {params.picklistId}.</p>
    </Card>
  );
}

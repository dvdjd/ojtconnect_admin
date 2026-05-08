import { Badge } from "@/components/ui/badge";

export function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <Badge variant={verified ? "default" : "secondary"}>
      {verified ? "Verified" : "Pending"}
    </Badge>
  );
}

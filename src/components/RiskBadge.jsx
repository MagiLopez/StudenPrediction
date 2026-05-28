import { Badge } from "@/components/ui/badge"

const config = {
  alto:  { variant: "high",   label: "Alto" },
  medio: { variant: "medium", label: "Medio" },
  bajo:  { variant: "low",    label: "Bajo" },
}

export default function RiskBadge({ riesgo }) {
  const { variant, label } = config[riesgo] ?? config.bajo
  return <Badge variant={variant}>{label}</Badge>
}

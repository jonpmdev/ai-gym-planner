// Force dynamic rendering for all dashboard routes
// This prevents static generation which would fail without Supabase env vars
export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

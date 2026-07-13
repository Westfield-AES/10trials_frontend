import { AuthGuard } from "@/components/providers/auth-guard";
import { AppShell } from "@/components/app/app-shell";
export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { hasRole } from "@/lib/auth-roles";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!hasRole(session?.user?.role, ["admin"])) {
    redirect("/social");
  }
  return <>{children}</>;
}

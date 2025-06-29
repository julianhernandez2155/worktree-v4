export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Navigation is now handled by PersistentLayout in the parent (dashboard) layout
  return <>{children}</>;
}
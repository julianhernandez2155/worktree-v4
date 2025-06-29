import { PersistentLayout } from '@/components/navigation/PersistentLayout';

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersistentLayout>
      {children}
    </PersistentLayout>
  );
}
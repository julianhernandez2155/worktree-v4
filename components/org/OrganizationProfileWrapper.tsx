'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationProfile } from './OrganizationProfile';

interface OrganizationProfileWrapperProps {
  initialData: {
    organization: any;
    memberCount: number;
    projectCount: number;
    publicProjects: any[];
    completedProjects: any[];
    skillsCount: number;
    skillsList: string[];
    leadershipTeam: any[];
    recentActivities: any[];
    isMember: boolean;
    isAdmin: boolean;
  };
}

export function OrganizationProfileWrapper({ initialData }: OrganizationProfileWrapperProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  const handleUpdate = () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  return (
    <OrganizationProfile
      {...data}
      onUpdate={handleUpdate}
    />
  );
}
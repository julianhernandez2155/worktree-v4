'use client';

import { useState } from 'react';
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
  const _router = useRouter();
  const [data, _setData] = useState(initialData);

  return (
    <OrganizationProfile
      {...data}
    />
  );
}
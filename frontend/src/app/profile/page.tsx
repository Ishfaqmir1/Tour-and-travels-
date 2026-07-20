'use client';

import dynamic from 'next/dynamic';

// Dynamically import the profile page with SSR disabled
// This prevents the "location is not defined" error during Next.js build
// caused by axios/browser-API dependencies in the component tree
const ProfilePageContent = dynamic(
  () => import('./ProfilePageContent'),
  { ssr: false }
);

export default function ProfilePage() {
  return <ProfilePageContent />;
}

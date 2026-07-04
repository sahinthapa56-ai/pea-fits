"use client";

import React, { Suspense } from "react";

// Defer the actual profile content to a lazy-loadable client component
// so we can wrap useSearchParams() in a Suspense boundary (Next.js 15 requirement).
const ProfileContent = React.lazy(() => import("./ProfileContent"));

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-text-secondary text-sm">Loading profile…</div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

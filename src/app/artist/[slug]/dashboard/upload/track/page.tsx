"use client";

import { useCatalog } from "@/lib/use-catalog";
import { useAuth } from "@/context/auth-context";
import { LoginRequired } from "@/components/login-required";
import { TrackReleaseForm } from "@/components/track-release-form";

export default function TrackUploadPage() {
  const catalog = useCatalog();
  const { loading, activeArtistId } = useAuth();
  const me = activeArtistId ? catalog?.getArtistById(activeArtistId) : undefined;

  if (loading) return null;
  if (!activeArtistId) return <LoginRequired />;

  return <TrackReleaseForm mode="create" artistId={activeArtistId} artistName={me?.name} />;
}

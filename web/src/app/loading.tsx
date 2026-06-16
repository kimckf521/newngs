export default function Loading() {
  return (
    <div className="ngs-redesign flex min-h-screen items-center justify-center bg-night font-sans antialiased">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-ngs-violet" />
        <p className="text-sm text-white/50">Loading…</p>
      </div>
    </div>
  );
}

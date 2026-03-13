export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-warm)]">
      <div className="flex flex-col items-center gap-[16px]">
        <div className="w-[40px] h-[40px] border-[3px] border-[var(--warm-stone)] border-t-[var(--burnt-orange)] rounded-full animate-spin" />
        <span className="font-label font-bold text-[11px] tracking-[3px] text-[var(--text-muted)]">
          LOADING
        </span>
      </div>
    </div>
  );
}

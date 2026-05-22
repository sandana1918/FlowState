export const FallbackBanner = ({ warning }: { warning?: string }) =>
  warning ? (
    <div className="rounded-2xl border border-warning/30 bg-[#fff8e1] px-4 py-3 text-sm text-[#8d6e00]">
      Fallback mode active. {warning}
    </div>
  ) : null;

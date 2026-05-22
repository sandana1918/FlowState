export const FallbackBanner = ({ warning }: { warning?: string }) =>
  warning ? (
    <div className="rounded-2xl border border-warning/30 bg-[#fff8e1] px-4 py-3 text-sm text-[#8d6e00]">
      Live runtime data is unavailable. {warning}
    </div>
  ) : null;

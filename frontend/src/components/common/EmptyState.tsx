export const EmptyState = ({
  title,
  description
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-2xl border border-success/20 bg-success/5 p-8 text-center">
    <div className="mx-auto mb-3 h-3 w-3 animate-pulse rounded-full bg-success" />
    <h3 className="text-lg font-semibold text-text">{title}</h3>
    <p className="mt-2 text-sm text-muted">{description}</p>
  </div>
);

export const ErrorState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-critical/30 bg-critical/10 p-8 text-center text-critical">
    {message}
  </div>
);


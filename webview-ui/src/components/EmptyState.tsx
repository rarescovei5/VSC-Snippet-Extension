type EmptyStateProps = { icon: React.ReactNode; title: string; message: string };
export const EmptyState = ({ icon, title, message }: EmptyStateProps) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center !text-text">
    {icon}
    <h1 className="mt-4 text-2xl font-medium">{title}</h1>
    <p className="mt-1 text-sm text-text-muted">{message}</p>
  </div>
);

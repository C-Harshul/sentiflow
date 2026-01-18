const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin-slow" />
      <p className="text-muted-foreground animate-pulse">Analyzing with Cloudflare AI...</p>
    </div>
  );
};

export default LoadingSpinner;

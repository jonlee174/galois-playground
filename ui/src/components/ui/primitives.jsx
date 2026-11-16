export const Button = ({ onClick, disabled, children, className = "", variant = "primary" }) => {
  const styles =
    variant === "primary"
      ? "bg-accent-400 text-black border-accent-400 hover:bg-accent-300 hover:border-accent-300 active:bg-accent-500"
      : "bg-transparent text-gray-100 border-gray-600 hover:border-accent-400 hover:text-accent-300";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 border uppercase tracking-wider transition-colors duration-100 disabled:bg-gray-900 disabled:border-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = "" }) => (
  <section className={`bg-gray-950 border border-gray-800 ${className}`}>{children}</section>
);

export const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;

// Small-caps section heading with a tan square marker.
export const SectionTitle = ({ children, icon: Icon, className = "", right = null }) => (
  <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4 ${className}`}>
    <h3 className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-gray-100">
      {Icon ? <Icon className="w-4 h-4 text-accent-400" /> : <span className="w-2 h-2 bg-accent-400" />}
      {children}
    </h3>
    {right}
  </div>
);

// Inner tile used inside cards.
export const Panel = ({ children, className = "" }) => (
  <div className={`bg-black border border-gray-800 p-4 ${className}`}>{children}</div>
);

export const Spinner = ({ className = "w-5 h-5" }) => <span className={`spinner-square ${className}`} aria-hidden />;

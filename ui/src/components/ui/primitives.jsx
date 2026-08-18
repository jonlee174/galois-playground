export const Button = ({ onClick, disabled, children, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-800 active:to-gray-900 text-gray-100 rounded-lg disabled:from-gray-900 disabled:to-black disabled:text-gray-500 disabled:cursor-not-allowed transform transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl active:shadow-md font-semibold border border-gray-600 hover:border-accent-500/60 active:border-gray-600 ring-0 hover:ring-2 hover:ring-accent-500/20 ${className}`}
  >
    {children}
  </button>
);

export const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-950/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-800 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

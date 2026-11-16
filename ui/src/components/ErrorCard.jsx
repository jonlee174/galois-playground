import MathDisplay, { MathText, Rationals } from "./math/MathDisplay";
import { Button, Card, CardContent } from "./ui/primitives";
import { ErrorIcon, OfflineIcon, WarningIcon } from "./icons";

const Shell = ({ icon: Icon, title, tone, children, onDismiss }) => (
  <Card className={`animate-fadeIn border-l-4 ${tone.border}`}>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${tone.icon}`} />
        <h2 className={`text-xl uppercase tracking-wide ${tone.title}`}>{title}</h2>
      </div>
      {children}
      <Button onClick={onDismiss} variant="secondary" className="text-sm px-4 py-2">
        Dismiss
      </Button>
    </CardContent>
  </Card>
);

export default function ErrorCard({ error, onDismiss }) {
  if (error.type === "reducible") {
    return (
      <Shell
        icon={WarningIcon}
        title="Reducible polynomial"
        tone={{ border: "border-l-accent-400", icon: "text-accent-400", title: "text-accent-300" }}
        onDismiss={onDismiss}
      >
        <div className="bg-black border border-gray-800 p-3 text-center">
          <MathDisplay>{error.polynomial.replace(/\^(\d+)/g, "^{$1}").replace(/\*/g, "")}</MathDisplay>
        </div>
        <p className="text-gray-300">
          Degree {error.degree}. <MathText>{error.message}</MathText>
        </p>
        <p className="text-gray-400 text-sm">
          A reducible polynomial factors into smaller polynomials over <Rationals />, so there's no single Galois
          group to speak of. Try an irreducible one such as <MathDisplay inline>{"x^2-2"}</MathDisplay>,{" "}
          <MathDisplay inline>{"x^3-2"}</MathDisplay> or <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>.
        </p>
      </Shell>
    );
  }

  if (error.type === "computation") {
    return (
      <Shell
        icon={ErrorIcon}
        title="Computation error"
        tone={{ border: "border-l-red-400", icon: "text-red-400", title: "text-red-300" }}
        onDismiss={onDismiss}
      >
        <p className="text-red-200">
          <MathText>{error.message}</MathText>
        </p>
        <p className="text-gray-400 text-sm">Check the polynomial syntax and try again.</p>
      </Shell>
    );
  }

  return (
    <Shell
      icon={OfflineIcon}
      title="Network error"
      tone={{ border: "border-l-gray-500", icon: "text-gray-400", title: "text-gray-200" }}
      onDismiss={onDismiss}
    >
      <p className="text-gray-200">{error.message}</p>
      <p className="text-gray-400 text-sm">Is the backend running on port 8001?</p>
    </Shell>
  );
}

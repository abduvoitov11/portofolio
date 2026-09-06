import { useEffect, useState } from "react";
export const ErrorOverlay = () => {
  const [error, setError] = useState<string>("");
  useEffect(() => {
    const handler = (e: ErrorEvent) => setError(e.message + " at " + e.filename + ":" + e.lineno);
    window.addEventListener("error", handler);
    const unhandled = (e: PromiseRejectionEvent) => setError("Promise rejection: " + String(e.reason));
    window.addEventListener("unhandledrejection", unhandled);
    return () => { window.removeEventListener("error", handler); window.removeEventListener("unhandledrejection", unhandled); }
  }, []);
  if (!error) return null;
  return <div style={{position: "fixed", top: 0, left: 0, zIndex: 999999, background: "red", color: "white", padding: 20}}>{error}</div>;
};

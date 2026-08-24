import * as React from "react";

/**
 * False during SSR and on the very first client render, true afterwards.
 * Use it to gate persisted (localStorage-backed) state so the server HTML and
 * the first client render always match.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

export default useHydrated;

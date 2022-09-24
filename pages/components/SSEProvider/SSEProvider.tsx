import type { SSEEvent } from "../../../lib/sse/sse";
import { ReactNode, createContext, useEffect, useState } from "react";

export default function SSEProvider({ children }: { children: ReactNode }) {
  const SSEContext = createContext<EventSource | undefined>(undefined);
  const [eventSource, setEventSource] = useState<EventSource | undefined>(
    undefined
  );

  useEffect(() => {
    const es = new EventSource("/api/sse", { withCredentials: true });
    setEventSource(es);
    es.onmessage = (event) => {
      console.log(event);
    };
    return () => es.close();
  }, []);

  return (
    <SSEContext.Provider value={eventSource}>{children}</SSEContext.Provider>
  );
}

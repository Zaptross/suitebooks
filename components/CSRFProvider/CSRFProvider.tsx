import ut from "util/types";
import { ReactNode, createContext, useEffect, useState } from "react";
import { V4 } from "paseto";

export default function CSRFProvider({ children }: { children: ReactNode }) {
  const CSRFContext = createContext<string | undefined>(undefined);
  const [CSRFToken, setCSRFToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    addEventListener("loginSuccess", async (e) => {
      const event = e as CustomEvent;

      const publicKey = V4.bytesToKeyObject(
        Buffer.from(process.env.NEXT_PUBLIC_CSRF_PUBLIC_KEY!, "hex")
      );

      const token: Record<string, string> = (await V4.verify(
        event.detail.token,
        publicKey,
        {
          issuer: window.location.origin,
          audience: window.location.origin,
        }
      )) as unknown as { csrf: string; sub: string };

      sessionStorage.setItem("csrf", token.csrf);
      sessionStorage.setItem("uuid", token.csrf);
    });

    setTimeout(() => {
      const ev = new CustomEvent("loginSuccess", {
        detail: {
          token:
            "v4.public.eyJjb250ZW50cyI6InVudG91Y2hlZCIsImlhdCI6IjIwMjItMTAtMDlUMDA6NTc6MzkuOTMxWiIsImlzcyI6ImZvbyJ9-uudzouDV9D_hf8JwgLfDPODboyuQlJcgY4K5fhCkp7UDMZ57CZVBUATOo3ARtweUeXIbKS-H8C4I3H8naLhDQ",
        },
      });
      document.dispatchEvent(ev);
    }, 2_000);
  }, []);

  return (
    <CSRFContext.Provider value={CSRFToken}>
      <div
        className={
          process.env.NODE_ENV === "development" ? "bg-pink-500/50" : ""
        }
      >
        {children}
      </div>
    </CSRFContext.Provider>
  );
}

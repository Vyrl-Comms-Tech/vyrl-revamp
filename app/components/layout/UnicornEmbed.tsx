// "use client";
// import { useEffect, useRef } from "react";

// declare global {
//   interface Window {
//     UnicornStudio?: {
//       isInitialized?: boolean;
//       init: () => void;
//     };
//   }
// }

// const SCRIPT_SRC =
//   "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.8/dist/unicornStudio.umd.js";

// // Multiple components (HomeHero, Footer) can each render one of these
// // embeds on the same page. UnicornStudio's own init() scans the whole
// // document for every [data-us-project] element, so it only ever needs
// // to run once per page, after the script itself has loaded — calling
// // it once per embed instance raced multiple inits against each other
// // and crashed. This tracks the script load and the "has init() run
// // yet" state globally (module-scope, shared across every instance)
// // so no matter how many UnicornEmbeds are on the page, the script is
// // fetched once and init() fires exactly once, covering every embed
// // already in the DOM at that point.
// let scriptPromise: Promise<void> | null = null;

// function loadUnicornScript(): Promise<void> {
//   if (typeof window === "undefined") return Promise.resolve();
//   if (window.UnicornStudio?.isInitialized) return Promise.resolve();
//   if (scriptPromise) return scriptPromise;

//   scriptPromise = new Promise((resolve) => {
//     const existing = document.querySelector<HTMLScriptElement>(
//       `script[src="${SCRIPT_SRC}"]`,
//     );
//     if (existing) {
//       existing.addEventListener("load", () => resolve());
//       return;
//     }
//     const script = document.createElement("script");
//     script.src = SCRIPT_SRC;
//     script.onload = () => resolve();
//     document.body.appendChild(script);
//   });

//   return scriptPromise;
// }

// export default function UnicornEmbed({
//   projectId,
//   className,
// }: {
//   projectId: string;
//   className?: string;
// }) {
//   const mountedRef = useRef(false);

//   useEffect(() => {
//     mountedRef.current = true;
//     loadUnicornScript().then(() => {
//       if (!mountedRef.current) return;
//       window.UnicornStudio?.init();
//     });
//     return () => {
//       mountedRef.current = false;
//     };
//   }, []);

//   return (
//     <div
//       className={className}
//       style={{ width: "100%", height: "100%" }}
//       data-us-project={projectId}
//     />
//   );
// }
"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized?: boolean;
      init: () => void | Promise<void>;
    };
  }
}

const SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.8/dist/unicornStudio.umd.js";

let scriptPromise: Promise<void> | null = null;
let initPromise: Promise<void> | null = null;

function loadUnicornScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.UnicornStudio) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript =
      document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`,
      );

    if (existingScript) {
      // Script may have already loaded.
      if (window.UnicornStudio) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Unicorn Studio script")),
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src = SCRIPT_SRC;
    script.async = true;

    script.addEventListener("load", () => resolve(), {
      once: true,
    });

    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Unicorn Studio script")),
      { once: true },
    );

    document.body.appendChild(script);
  });

  return scriptPromise;
}

async function initializeUnicornStudio(): Promise<void> {
  await loadUnicornScript();

  if (window.UnicornStudio?.isInitialized) {
    return;
  }

  if (!initPromise) {
    initPromise = Promise.resolve(
      window.UnicornStudio?.init(),
    ).then(() => undefined);
  }

  return initPromise;
}

type UnicornEmbedProps = {
  projectId: string;
  className?: string;
};

export default function UnicornEmbed({
  projectId,
  className,
}: UnicornEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  let cancelled = false;

  const start = () => {
    if (cancelled) return;

    initializeUnicornStudio().catch((error) => {
      console.error("Unicorn Studio initialization failed:", error);
    });
  };

  if ("requestIdleCallback" in window) {
    const idleId = window.requestIdleCallback(start, {
      timeout: 2000,
    });

    return () => {
      cancelled = true;
      window.cancelIdleCallback(idleId);
    };
  }

  const timeoutId = window.setTimeout(start, 1000);

  return () => {
    cancelled = true;
    window.clearTimeout(timeoutId);
  };
}, []);
  return (
    <div
      ref={containerRef}
      className={className}
      data-us-project={projectId}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}
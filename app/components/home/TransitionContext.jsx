// "use client";
// import { createContext, useContext, useRef, useCallback } from "react";

// const TransitionContext = createContext(null);

// export function TransitionProvider({ children }) {
//   const flipStateRef = useRef(null);

//   const saveFlipState = useCallback((state) => {
//     flipStateRef.current = state;
//   }, []);

//   const consumeFlipState = useCallback(() => {
//     const s = flipStateRef.current;
//     flipStateRef.current = null;
//     return s;
//   }, []);

//   return (
//     <TransitionContext.Provider value={{ saveFlipState, consumeFlipState }}>
//       {children}
//     </TransitionContext.Provider>
//   );
// }

// export const usePageTransition = () => useContext(TransitionContext);

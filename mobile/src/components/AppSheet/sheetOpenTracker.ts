import { createContext } from "react";

/** Lets every AppSheet report open/closed so screens can pause keyboard auto-scroll. */
export interface SheetOpenTracker {
  increment: () => void;
  decrement: () => void;
}

export const SheetOpenTrackerContext = createContext<SheetOpenTracker | null>(
  null,
);

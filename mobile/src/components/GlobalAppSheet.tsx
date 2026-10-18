import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AppSheet, { AppSheetProps, AppSheetRef } from "./AppSheet/AppSheet";

interface GlobalAppSheetContextType {
  openAppSheet: (children: React.ReactNode, config?: AppSheetProps) => void;
  closeAppSheet: () => void;
}

const GlobalAppSheetContext = createContext<GlobalAppSheetContextType | null>(
  null,
);

export const useGlobalAppSheet = () => {
  const context = useContext(GlobalAppSheetContext);
  if (!context) {
    throw new Error(
      "useGlobalAppSheet must be used within GlobalAppSheetProvider",
    );
  }
  return context;
};

interface GlobalAppSheetProviderProps {
  children: React.ReactNode;
}

type SheetEntry = {
  id: number;
  children: React.ReactNode;
  config?: AppSheetProps;
};

/** One stacked global sheet; presents itself on mount, reports when dismissed. */
const GlobalSheetItem = ({
  entry,
  register,
  onDismissed,
}: {
  entry: SheetEntry;
  register: (id: number, sheet: AppSheetRef | null) => void;
  onDismissed: (id: number) => void;
}) => {
  const sheetRef = useRef<AppSheetRef>(null);

  useEffect(() => {
    register(entry.id, sheetRef.current);
    sheetRef.current?.open(entry.children, entry.config);
    return () => register(entry.id, null);
    // Content is a snapshot taken at openAppSheet() time.
  }, []);

  return <AppSheet ref={sheetRef} onDismiss={() => onDismissed(entry.id)} />;
};

export const GlobalAppSheetProvider: React.FC<GlobalAppSheetProviderProps> = ({
  children,
}) => {
  const [entries, setEntries] = useState<SheetEntry[]>([]);
  const entriesRef = useRef<SheetEntry[]>([]);
  const sheetsRef = useRef(new Map<number, AppSheetRef>());
  const closingRef = useRef(new Set<number>());
  const nextIdRef = useRef(0);

  const updateEntries = useCallback(
    (updater: (prev: SheetEntry[]) => SheetEntry[]) => {
      entriesRef.current = updater(entriesRef.current);
      setEntries(entriesRef.current);
    },
    [],
  );

  const register = useCallback((id: number, sheet: AppSheetRef | null) => {
    if (sheet) sheetsRef.current.set(id, sheet);
    else sheetsRef.current.delete(id);
  }, []);

  const handleDismissed = useCallback(
    (id: number) => {
      closingRef.current.delete(id);
      updateEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [updateEntries],
  );

  const openAppSheet = useCallback(
    (sheetChildren?: React.ReactNode, config?: AppSheetProps) => {
      if (!sheetChildren) return;
      const id = ++nextIdRef.current;
      updateEntries((prev) => [
        ...prev,
        { id, children: sheetChildren, config },
      ]);
    },
    [updateEntries],
  );

  // Closes the top-most sheet that is not already closing.
  const closeAppSheet = useCallback(() => {
    const top = [...entriesRef.current]
      .reverse()
      .find((entry) => !closingRef.current.has(entry.id));
    if (!top) return;
    closingRef.current.add(top.id);
    sheetsRef.current.get(top.id)?.close();
  }, []);

  const value = useMemo(
    () => ({ openAppSheet, closeAppSheet }),
    [openAppSheet, closeAppSheet],
  );

  // The modal provider lives inside the context so sheet content (rendered in
  // its portal host) can still call useGlobalAppSheet, e.g. DatePicker.
  return (
    <GlobalAppSheetContext.Provider value={value}>
      <BottomSheetModalProvider>
        {children}
        {entries.map((entry) => (
          <GlobalSheetItem
            key={entry.id}
            entry={entry}
            register={register}
            onDismissed={handleDismissed}
          />
        ))}
      </BottomSheetModalProvider>
    </GlobalAppSheetContext.Provider>
  );
};

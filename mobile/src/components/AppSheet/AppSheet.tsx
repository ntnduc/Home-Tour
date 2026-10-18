import {
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokens } from "@/theme";
import AppSheetBackdropComponent from "./AppSheetBackdropComponent";
import AppSheetHandleComponent from "./AppSheetHandleComponent";
import AppSheetHeader from "./AppSheetHeader";

export type HeaderConfig = {
  element?: ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
  height?: number;
  onClose?: () => void;
};

export interface AppSheetProps extends Omit<
  BottomSheetModalProps,
  "ref" | "children"
> {
  classNameContent?: string;
  styleContent?: StyleProp<ViewStyle>;
  header?: HeaderConfig;
  children?: ReactNode;
  ignoreBottomInset?: boolean;
  ignoreBottomSheetInset?: boolean;
  renderFooter?: (props: BottomSheetFooterProps) => ReactNode;
  /** Called once the sheet is fully dismissed (pan down, backdrop, close()). */
  onClose?: () => void;
}

export interface AppSheetRef {
  /**
   * Present the sheet. `children` / `config` override the props given to
   * <AppSheet>; omit them to present the declarative `children` prop.
   */
  open: (children?: ReactNode, config?: AppSheetProps) => void;
  close: () => void;
  snapToIndex: (index: number) => void;
  snapToPosition: (position: string | number) => void;
  collapse: () => void;
}

type OpenState = {
  children?: ReactNode;
  config?: AppSheetProps;
};

const DEFAULT_SNAP_POINTS = ["50%"];
const DEFAULT_HEADER_HEIGHT = 56;

/**
 * Shared bottom sheet built on BottomSheetModal:
 * - rendered through the portal at the provider root, so it never shows up
 *   inside the parent layout (e.g. at the end of a ScrollView) while closed,
 *   and its content is not mounted until opened;
 * - the header is rendered as the sheet handle, so scrollable content gets the
 *   real remaining height and dragging/closing is done from the header only
 *   (content panning is off by default when a header exists, which avoids a
 *   scroll-to-top gesture closing the sheet).
 */
const AppSheet = forwardRef<AppSheetRef, AppSheetProps>((props, ref) => {
  const insets = useSafeAreaInsets();
  const modalRef = useRef<BottomSheetModal>(null);
  const [openState, setOpenState] = useState<OpenState | null>(null);
  const openStateRef = useRef<OpenState | null>(null);

  // Open-time config overrides the declarative props.
  const { children: propChildren, ...propConfig } = props;
  const config: AppSheetProps = { ...propConfig, ...openState?.config };
  const children =
    openState?.children !== undefined ? openState.children : propChildren;

  const {
    header: headerConfig,
    renderFooter,
    ignoreBottomInset,
    ignoreBottomSheetInset,
    classNameContent,
    styleContent,
    onClose,
    onDismiss,
    ...modalProps
  } = config;

  const updateOpenState = (next: OpenState | null) => {
    openStateRef.current = next;
    setOpenState(next);
  };

  const open = useCallback(
    (nextChildren?: ReactNode, nextConfig?: AppSheetProps) => {
      updateOpenState({ children: nextChildren, config: nextConfig });
      if (!nextConfig?.ignoreBottomSheetInset) {
        modalRef.current?.present();
      }
    },
    [],
  );

  const handleDismiss = useCallback(() => {
    const openConfig = openStateRef.current?.config;
    (openConfig?.onClose ?? props.onClose)?.();
    openConfig?.onDismiss?.();
    props.onDismiss?.();
    updateOpenState(null);
  }, [props.onClose, props.onDismiss]);

  const close = useCallback(() => {
    if (openStateRef.current?.config?.ignoreBottomSheetInset) {
      handleDismiss();
      return;
    }
    modalRef.current?.dismiss();
  }, [handleDismiss]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
      snapToIndex: (index: number) => modalRef.current?.snapToIndex(index),
      snapToPosition: (position: string | number) =>
        modalRef.current?.snapToPosition(position),
      collapse: () => modalRef.current?.collapse(),
    }),
    [open, close],
  );

  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <AppSheetBackdropComponent {...backdropProps} onBackdropPress={close} />
    ),
    [close],
  );

  const headerElement = headerConfig?.element;
  const headerTitle = headerConfig?.title;
  const headerStyle = headerConfig?.style;
  const headerClassName = headerConfig?.className;
  const headerHeight = headerConfig?.height ?? DEFAULT_HEADER_HEIGHT;
  const hasHeader = !!headerConfig;

  // Header doubles as the drag handle; memoized so the handle is not remounted
  // on every parent render.
  const renderHandle = useMemo(() => {
    if (!hasHeader) return AppSheetHandleComponent;
    const HeaderHandle = () => (
      <View
        style={[styles.headerContainer, headerStyle, { height: headerHeight }]}
      >
        {headerElement ?? (
          <AppSheetHeader
            title={headerTitle}
            className={headerClassName}
            onClose={close}
          />
        )}
      </View>
    );
    return HeaderHandle;
  }, [
    hasHeader,
    headerElement,
    headerTitle,
    headerStyle,
    headerClassName,
    headerHeight,
    close,
  ]);

  if (ignoreBottomSheetInset) {
    return openState ? <>{children}</> : null;
  }

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={DEFAULT_SNAP_POINTS}
      enableDynamicSizing={false}
      enablePanDownToClose
      enableOverDrag={false}
      enableHandlePanningGesture
      enableContentPanningGesture={!hasHeader}
      stackBehavior="push"
      detached
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      {...modalProps}
      handleComponent={
        "handleComponent" in modalProps
          ? modalProps.handleComponent
          : renderHandle
      }
      onDismiss={handleDismiss}
      android_keyboardInputMode="adjustResize"
    >
      {children ?? (
        <BottomSheetView>
          <Text>Chưa có nội dung</Text>
        </BottomSheetView>
      )}
      {hasHeader && !ignoreBottomInset && (
        <View style={{ height: insets.bottom }} />
      )}
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: tokens.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
});

export const stylesHeader = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#222",
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "95%",
    backgroundColor: "#fff",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  fixedHeaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

AppSheet.displayName = "AppSheet";

export default AppSheet;

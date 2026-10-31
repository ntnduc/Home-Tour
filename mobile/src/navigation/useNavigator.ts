import {
  CommonActions,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo } from "react";

import { RootStackParamList, TabParamList } from "./types";

type StackNav = NativeStackNavigationProp<RootStackParamList>;

/** Params arg is optional when the route takes none, required otherwise. */
type RouteArgs<R extends keyof RootStackParamList> =
  undefined extends RootStackParamList[R]
    ? [params?: RootStackParamList[R]]
    : [params: RootStackParamList[R]];

type TabArgs<T extends keyof TabParamList> =
  undefined extends TabParamList[T]
    ? [params?: TabParamList[T]]
    : [params: TabParamList[T]];

/**
 * Shared navigation actions so screens stop re-typing `useNavigation` unions.
 *
 * - `goTo` pushes/navigates to a root stack route, `replace` swaps the current one.
 * - `goToTab` jumps to a bottom tab, clearing everything above `MainTabs`.
 * - `goHome` = the main screen (Rooms tab) with a clean stack.
 * - `goBack` is safe when there is no history (falls back to the main screen).
 */
export const useNavigator = () => {
  const navigation = useNavigation<StackNav>();

  return useMemo(() => {
    const goToTab = <T extends keyof TabParamList>(
      tab: T,
      ...args: TabArgs<T>
    ) => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "MainTabs",
              params: { screen: tab, params: args[0] },
            },
          ],
        }),
      );
    };

    const goHome = () => goToTab("Rooms");

    return {
      /** Raw navigation object for rare cases (setOptions, addListener, ...). */
      navigation,
      goTo: <R extends keyof RootStackParamList>(
        route: R,
        ...args: RouteArgs<R>
      ) => {
        (navigation.navigate as (name: string, params?: object) => void)(
          route,
          args[0] as object | undefined,
        );
      },
      push: <R extends keyof RootStackParamList>(
        route: R,
        ...args: RouteArgs<R>
      ) => {
        navigation.dispatch(
          StackActions.push(route, args[0] as object | undefined),
        );
      },
      replace: <R extends keyof RootStackParamList>(
        route: R,
        ...args: RouteArgs<R>
      ) => {
        navigation.dispatch(
          StackActions.replace(route, args[0] as object | undefined),
        );
      },
      goBack: () => {
        if (navigation.canGoBack()) navigation.goBack();
        else goHome();
      },
      popToTop: () => navigation.dispatch(StackActions.popToTop()),
      goToTab,
      goHome,
      setOptions: navigation.setOptions,
    };
  }, [navigation]);
};

export default useNavigator;

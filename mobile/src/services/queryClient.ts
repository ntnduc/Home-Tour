import { QueryClient } from "@tanstack/react-query";

// Single shared client so the cache can be cleared outside React (e.g. on logout / failed refresh)
export const queryClient = new QueryClient();

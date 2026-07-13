import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppSettingsProvider>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </AppSettingsProvider>
  </QueryClientProvider>
);

export default App;

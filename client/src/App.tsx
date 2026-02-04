import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BuilderProvider } from "./contexts/BuilderContext";
import Home from "./pages/Home";
import TemplateGallery from "./pages/TemplateGallery";
import Editor from "./pages/Editor";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/templates"} component={TemplateGallery} />
      <Route path={"/editor"} component={Editor} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <BuilderProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BuilderProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

/* @refresh reload */
import { render } from "solid-js/web";
import Routes from "./routes";
import "./App.css";
import { TrackingProvider } from "./contexts/Tracking";
render(
  () => (
    <TrackingProvider>
      <Routes />
    </TrackingProvider>
  ),
  document.getElementById("root") as HTMLElement,
);

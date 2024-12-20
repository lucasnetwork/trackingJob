/* @refresh reload */
import { render } from "solid-js/web";
import Routes from "./routes";

render(() => <Routes />, document.getElementById("root") as HTMLElement);

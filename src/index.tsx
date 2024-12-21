/* @refresh reload */
import { render } from "solid-js/web";
import Routes from "./routes";
import "./App.css";
render(() => <Routes />, document.getElementById("root") as HTMLElement);

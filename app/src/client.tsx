import { hydrate } from "solid-js/web";
import { Counter } from "./root";

hydrate(() => <Counter />, document.getElementById("app"));

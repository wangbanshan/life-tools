import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "dayjs/locale/zh-cn";
import "./styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

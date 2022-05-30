import { HydrationScript } from "solid-js/web";
import { Counter } from "./root";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/style.css" />
        <HydrationScript />
      </head>
      <body>
        <div id="app">
          <Counter />
        </div>
        <script type="module" src="./client.js"></script>
      </body>
    </html>
  );
}

import { serve } from "https://deno.land/std@0.130.0/http/server.ts";
import { parse, join } from "https://deno.land/std@0.130.0/path/mod.ts";
import { copy } from "https://deno.land/std@0.130.0/fs/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.130.0/streams/mod.ts";
import { lookup } from "https://deno.land/x/media_types/mod.ts";

import { build, Plugin } from "https://deno.land/x/esbuild@v0.14.27/mod.js";
import { transformAsync } from "https://esm.sh/@babel/core";
import ts from "https://esm.sh/@babel/preset-typescript";
import solid from "https://esm.sh/babel-preset-solid";
import { renderToStream } from "solid-js/web";

export interface SolidOptions {
  hydratable?: boolean;
  generate?: "dom" | "ssr";
}

function solidPlugin(options: SolidOptions = {}): Plugin {
  return {
    name: "esbuild:solid",

    setup(build) {
      build.onLoad({ filter: /\.(t|j)sx$/ }, async (args) => {
        const source = await Deno.readTextFile(args.path);

        const { name, ext } = parse(args.path);
        const filename = name + ext;

        const { code } = (await transformAsync(source, {
          presets: [[solid, options], ts],
          filename,
          sourceMaps: "inline",
        }))!;

        return { contents: code!, loader: "js" };
      });
    },
  };
}

await copy("./app/public", "./dist", { overwrite: true });

await build({
  entryPoints: ["./app/src/server.tsx"],
  bundle: true,
  format: "esm",
  outdir: "./server",
  plugins: [solidPlugin({ generate: "ssr", hydratable: true })],
  external: ["solid-js"],
});

await build({
  entryPoints: ["./app/src/client.tsx"],
  bundle: true,
  outdir: "./dist",
  plugins: [solidPlugin({ hydratable: true })],
});

let mything = (await import(`../server/server.js`)).default;
console.log("http://localhost:8000/");
serve(
  async (req) => {
    const url = new URL(req.url);
    const filepath = decodeURIComponent(url.pathname);
    console.log(filepath);

    try {
      // Try opening the file
      let file = await Deno.open(join("./dist", filepath), { read: true });
      const stat = await file.stat();

      // If File instance is a directory, lookup for an index.html
      if (stat.isDirectory) {
        file.close();
        file = await Deno.open(join("./dist", filepath, "index.html"), {
          read: true,
        });
      }

      const readableStream = readableStreamFromReader(file);

      return new Response(readableStream, {
        headers: {
          "content-type": lookup(filepath),
        },
      });
    } catch (e) {
      console.log(e);
      const { readable, writable } = new TransformStream();
      const stream = renderToStream(mything);
      stream.pipeTo(writable);

      return new Response(readable, {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      });
    }
  },
  { port: 8000 }
);

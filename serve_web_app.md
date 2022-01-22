# Serve a "hello world" app

All source code in this tutorial can be found under [examples/hello_world](https://github.com/selfage/selfage.github.io/tree/main/examples/hello_world) directory. All commands in this tutorial should be executed from the root directory of your repository.

## Building a simple DOM tree

Let's start with a simple DOM tree to show "hello world!". You will need [@selfage/element](https://www.npmjs.com/package/@selfage/element).

Now let's create a file as `main.ts` (corresponds to `examples/hello_world/frontend/main.ts`).

```TypeScript
import { E } from "@selfage/element/factory";

document.documentElement.style.fontSize = "62.5%";
document.body.style.margin = "0";
document.body.style.fontSize = "0";

document.body.appendChild(
  E.div(
    {
      class: "main-body",
      style:
        "display: flex; flex-flow: column nowrap; min-height: 100vh; overflow-y: auto;",
    },
    E.div(
      {
        class: "main-text",
        style: "font-size: 1.6rem; color: black;",
      },
      E.text("Hello world!")
    )
  )
);
```

Note that `E` is simply a factory, providing syntax sugar to create vanilla HTML elements.

BTW, `rem` is more preferred than `px` or `em` in this tutorial. You can do more research on that as homework.

## Formatting

You can install [@selfage/cli](https://www.npmjs.com/package/@selfage/cli) to format your TypeScript code, by running `npx selfage fmt main`. It adds import-sorting features on top of `prettier`.

## Compiling/Transpiling

Then you will need to compile/transpile it. You can install [@selfage/tsconfig](https://www.npmjs.com/package/@selfage/tsconfig) to be the hassle-free compiler options for your `tsconfig.json`, ensuring compatibility with @selfage packages.

```JSON
{
  "extends": "@selfage/tsconfig"
}
```

## Serve the page locally

Although you don't write HTML code, unfortunatley, you still need a HTML file to load your TS/JS file. You will need [@selfage/bunlder_cli](https://www.npmjs.com/package/@selfage/bundler_cli).

Let's create a configuration file named as `entries.json`, which should be in the same directory as `main.ts`.

```JSON
{
  "entries": [{
    "source": "./main",
    "output": "./index"
  }]
}
```

The `source` field should point to the entry TypeScript file, which is `main.ts`. `.ts` can be neglected.

The `output` field specify the name of the output file without file extension.

The directory of this config file is also important that it must be the base directory of all files specified within it. In other words, there shouldn't be a path starting with `../`.

By running `npx bundage bwa -ec entries.json` (corresponds to `npx bundage bwa -ec examples/hello_world/frontend/entries.json`), several files are generated: `index.js`, `index.js.gz`, `index.html`, `index.html.gz`.

`index.js` is the compiled JS code out of `main.ts`. `index.html` has a single userful line which loads `index.js`. `.gz` files are pre-compressed files to reduce network traffic.

Finally, you can install [http-server](https://www.npmjs.com/package/http-server) to serve `index.html`, by running `npx http-server .` (corresponds to `npx http-server examples/hello_world/frontend`).

## Serve "static" content publicly

Besides [http-server](https://www.npmjs.com/package/http-server), there are lots of solutions these days to serve static HTML/JS files without explicitly setting up a machine or running a server. E.g., you can use [Google Cloud Storage](https://cloud.google.com/storage/docs/hosting-static-website).

Note that "static" can be misleading because such web pages can still host heavily user-interactable content or communicate with backend servers. More practically, "static" means easily cachable content (static HTML/JS files or image files), and the opposite means non-cachable data/action (user getting their profile data, or posting their content). Therefore, if you split those two cases from one server and setup caching for your "static" content, you will further reduce network traffic.

## Serve with more control

If you really want to start your own server, you will need [@selfage/web_app_base_dir](https://www.npmjs.com/package/@selfage/web_app_base_dir) and, as an example, [express](https://www.npmjs.com/package/express) as well as [express-static-gzip](https://www.npmjs.com/package/express-static-gzip).

```TypeScript
import express = require("express");
import expressStaticGzip = require("express-static-gzip");
import "@selfage/web_app_base_dir";

let app = express();
app.use(
  "/",
  expressStaticGzip(globalThis.WEB_APP_BASE_DIR, {
    serveStatic: {
      extensions: ["html"],
      fallthrough: false,
    },
  })
);
```

`express` helps setup HTTP routing and `express-static-gzip` leverages pre-compressed `.gz` files. Refer to their documents for more options.

`globalThis.WEB_APP_BASE_DIR` is a global variable declared by `@selfage/web_app_base_dir`, which should be pointing to the base directory of your web app, i.e. the directory of your `entries.json` file, but not until you run `npx bundage bws -ec entries.json` (corresponds to `npx bundage bws -ec examples/hello_world/frontend/entries.json`). Only then `globalThis.WEB_APP_BASE_DIR` is populated with the correct path (in the compiled JS code).

Note the use of `bws` which stands for "build web server" instead of `bwa` which means "build web apps".

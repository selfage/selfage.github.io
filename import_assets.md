# Import assets

Images, videos, or anything cannot be written in texts, cannot be bunlded in one monolithic JavaScript file. So they have to be loaded by browsers via URLs.

You can figure out their URLs based on their file paths and hard-code them in your web app. However that is fragile, if you move or rename those files and you forget to update their URLs.

Another commonly used approach is to split web servers with asset servers. Asset servers release changes rapidly and you only use assets when their URLs become avaible. However it's not hermetic, i.e., your tests will depend on live servers.

In this guide, we will use [@selfage/bundler_cli](https://www.npmjs.com/package/@selfage/bundler_cli) to generate URLs upon bundling, when code imports asssets by their relative file paths.

Sample code for this guide can be found under [examples/import_assets](https://github.com/selfage/selfage.github.io/tree/main/examples/import_assets) directory.

## Import assets and buid a DOM tree

Assets are imported the same way as importing other TypeScript libraries. [@selfage/element](https://www.npmjs.com/package/@selfage/element) is used to help build simple DOM tree.

Suppose you have a sample image `sample.jpg` located in the same directory as the `main.ts` shown blow.

```TypeScript
import sampleImagePath = require('./sample.jpg');
import { E } from '@selfage/element/factory';

document.body.appendChild(
  E.image(
    {
      class: "sample",
      style: "width: 40rem;",
      src: sampleImagePath
    }
  )
);
```

You didn't import a "real" image. Instead it's a URL path that can be used by attributes requiring a URL path, e.g., a `src` attribute.

`tsc` will likely complain because it doesn't understand how an image file can be imported. But don't worry. `@selfage/bundler_cli` will compile `main.ts` without an issue.

## Entries config with extra assets

[Serve a "hello world" app](/serve_web_app) guide introduced defining an entries config `entries.json` before bundling, where you need to specify `source` and `output` fields.

There is another field `extraAssets` which specifies extra assets that are not imported by any source files. E.g., a `favicon.ico` file.

```JSON
{
  "entries": [{
    "source": "./main",
    "output": "./index"
  }],
  "extraAssets": [
    "./favicon.ico"
  ]
}
```

That being said, `sampe.jpg` is already imported by `main.ts` and doesn't need to be specified anywhere in `entries.json`.

## Bundle

Now you can bundle your web apps via `npx bundage bwa -a .jpg .png -ec entries.json`. Note the use of `-a .jpg .png` which specifies the file extensions that should be treated as assets. `sample.jpg` is therefore an asset file and will be "transformed" into a URL path when bundling.

Note that you don't need to specify `.ico` even though `favicon.ico` is specified in `extraAssets`.

## Save typings

Typing `-a .jpg .png` each time isn't really fun. You can specify asset extensions in `package.json` in `assetExts` field as shown below.

```JSON
{
  "name": ...,
  "version": ...,
  "dependencies": ...,
  "assetExts": [
    ".jpg",
    ".png"
  ],
}
```

Now `npx bundage bwa -ec entries.json` is enough.

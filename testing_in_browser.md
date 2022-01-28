# Testing in browser

Testing your web apps is always a pain. Compicated setup, flaky, slow to start, etc.

You will learn how to use [@selfage/bundler_cli](https://www.npmjs.com/package/@selfage/bundler_cli) (alternatively [@selfage/puppeteer_test_executor](https://www.npmjs.com/package/@selfage/puppeteer_test_executor) which is based on [Puppeteer](https://www.npmjs.com/package/puppeteer)), [@selfage/test_runner](https://www.npmjs.com/package/@selfage/test_runner) and [@selfage/screenshot_test_matcher](https://www.npmjs.com/package/@selfage/screenshot_test_matcher), to can cut down complicated setup, with the downside that it only brings up the Chrome browser to test against.

Sample code for this guide can be found under [examples/testing_in_browser](https://github.com/selfage/selfage.github.io/tree/main/examples/testing_in_browser) directory.

## Create a simple component

Let's create a button [component](/design_web_components) with [@selfage/element](https://www.npmjs.com/package/@selfage/element) first, which triggers its own `click` event upon the button element's `click` event, (which is probably useless practically).

```TypeScript
import EventEmitter = require("events");
import { E } from "@selfage/element/factory";

export declare interface CommonButtonComponent {
  on(event: "click", listener: () => void | Promise<void>): this;
}

export class CommonButtonComponent extends EventEmitter {
  public body: HTMLButtonElement;

  public constructor(label: string) {
    super();
    this.body = E.button(
      {
        class: "button",
        style: "color: white; padding: 1rem; font-size: 1.6rem;",
      },
      E.text(label)
    );
  }

  public static create(label: string): CommonButtonComponent {
    return new CommonButtonComponent(label).init();
  }

  public init(): this {
    this.body.style.cursor = "pointer";
    this.body.style.backgroundColor = "Blue";
    this.body.disabled = false;
    this.body.addEventListener("click", () => this.click());
    return this;
  }

  public click(): void {
    this.emit("click");
  }
}
```

## Write a test with screenshot

Now let's test the button with a screenshot.

```TypeScript
import { CommonButtonComponent } from "./button_component";
import { asyncAssertScreenshot } from "@selfage/screenshot_test_matcher";
import { PUPPETEER_TEST_RUNNER } from "@selfage/test_runner";

PUPPETEER_TEST_RUNNER.run({
  name: "CommonButtonComponentTest",
  cases: [
    {
      name: "Render",
      execute: async () => {
        // Prepare
        await globalThis.setViewport(300, 100);
        let buttonComponent = new CommonButtonComponent("Try click!").init();

        // Execute
        document.body.appendChild(buttonComponent.body);

        // Verify
        await asyncAssertScreenshot(
          __dirname + "/button_render.png",
          __dirname + "/golden/button_render.png",
          __dirname + "/button_render_diff.png"
        );
      },
    },
  ],
});
```

BTW, simply commenting sections with "Prepare", "Execute", and "Verify" can help a lot for maintenance.

This test file will be run in Puppeteer/Chrome environment, which is why you can use `document` here.

`__dirname` is not available in browsers, but `@selfage/bundler_cli` or `browserify` replaces it with a URL path that maps to the current directory, such that all those image files will be read from and written to under that directory.

Screenshot tests are a popular way to verify your DOM trees and styles are applied correctly, by comparing with a known correct screenshot, i.e., a golden screenshot. See [@selfage/screenshot_test_matcher](https://www.npmjs.com/package/@selfage/screenshot_test_matcher) for how to use `asyncAssertScreenshot`.

However, taking screenshots is also not available in browsers, because there is no such Web APIs capable of doing so, due to security reasons, but `@selfage/puppeteer_test_executor` made it available by using `Puppeteer`'s magic `exposeFunction()`. It also provides a few file system APIs that directly read/write/delete files without the need of any user interactions.

## Run tests

If you installed `@selfage/bundler_cli`, you can use `npx bundage prun button_component_test` to kick off the test, outputting results to the command line. There is no magic but simply bundling the test file with all its dependencies, starting a local server, and serving a HTML file which loads this test file.

If you want to use your own bundler, then make the test file as the entry file to start bundling, while making sure `__dirname` can be replaced with reasonable URLs. You still need to install `@selfage/puppeteer_test_executor`, and use `npx pexe button_component_test` to kick off the test, supposing `button_component_test.js` is the bundled JS file.

If you want to run a single test case, you can use `npx bundage prun button_component_test -- -c Init` or `npx pexe button_component_test -- -c Init`. `-c` specify the name of that test case. See [@selfage/test_runner](https://www.npmjs.com/package/@selfage/test_runner) for more detailed explanation.

Unlike Nodejs environment which exits when no more functions/callbacks are enqueued, `npx bundage prun` or `npx pexe` will terminate execution when all test cases have been executed, so make sure you have awaited all async operations.

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

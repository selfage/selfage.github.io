# Design web components

Unlike React or Angular, @selfage packages don't provide any framework to create components. Instead, you will only find code patterns below, by using vanilla HTML elements.

[@selfage/element](https://www.npmjs.com/package/@selfage/element) and [@selfage/ref](https://www.npmjs.com/package/@selfage/ref) are used in the examples to help build DOM trees more concisely and elegantly with vanilla HTML elements.

## Component

A "component" is defined as a class whose name ends with "Component" and which exposes a single HTML element as its body.

```TypeScript
class ChatHistoryComponent {
  public body: HTMLDivElement;
}
```

`body` is then considered as being owned by this class. Though it's not like C++ that `body` will be destroyed together with the class, this class should be the only one removing its `body` from any DOM tree, if ever needed.

Then start building a DOM tree owned by this component inside its constructor.

```TypeScript
import { E } from "@selfage/element/factory";

export class ChatHistoryComponent {
  public body: HTMLDivElement;
  private button: HTMLButtonElement;

  public constructor(
    value: string,
    private limit: number
  ) {
    let buttonRef = new Ref<HTMLButtonElement>();
    let body = E.div(
      {
        class: "some-body",
        style: "display: flex; justify-content: center;",
      },
      E.div(
        {
          class: "some-text",
        },
        E.text(value)
      ),
      E.buttonRef(
        buttonRef,
        {
          class: "some-button",
        },
        E.text("Try click!")
      )
    );
    this.button = buttonRef.val;
  }

  public static create(value: string, limit: number): ChatHistoryComponent {
    return new ChatHistoryComponent(value, limit);
  }
}
```

If you have other operations than creating HTML elements, you can then add an `init()` function, and a `public static create()` function to call it. This pattern is called dependency injection.

```TypeScript
export class ChatHistoryComponent {
  // ...
  public static create(value: string, limit: number): ChatHistoryComponent {
    return new ChatHistoryComponent(value, limit).init();
  }
  //...
  public init(): this {
    // E.g., register events.
    return this;
  }
}
```

### Compose components

If you have followed the pattern above, composing components is as easy as appending their bodies to parent elements.

```TypeScript
import { ChatHistoryComponent } from "./chat_history_component";
import { E } from "@selfage/element/factory";

export class BodyComponent {
  public body: HTMLDivElement;

  public constructor(
    private chatHistoryComponent: ChatHistoryComponent
  ) {
    this.body = E.div(
      {
        class: "body-conainter",
        style: "display: flex;",
      },
      chatHistoryComponent.body
    );
  }

  public static create(): BodyComponent {
    return new BodyComponent(ChatHistoryComponent.create("Hello", "limit"));
  }
}
```

A `public static create()` function is defined for hiding its real dependency from its dependants, which also follows the dependency injection pattern.

### Mock component

Once you start building more components, some of them will start depending on others. Typically for unit tests, you want to mock dependencies because you don't have to understand all implementation details when preparing and executing tests, especially when the dependency chain becomes so long that you cannot possibly track.

However, DOM trees should not be mocked, because how HTML elements are rendered heavily depends on their parents, even multiple levels up. Think of how many CSS styles can be inherited. Therefore, in the above example, the DOM tree is created within the constructor and cannot be left out, if you create a mock class by inheritance.

```TypeScript
export class ChatHistoryComponentMock extends ChatHistoryComponent {
  public constructor() {
    super("Testing value", undefined);
  }
}

export class BodyComponentMock extends BodyComponent {
  public constructor() {
    super(new ChatHistoryComponentMock());
  }
}
```

Now `new BodyComponentMock()` creates a complete DOM tree, ready for [screenshot tests](/testing_in_browser), while you have the liberty to mock other public functions of `BodyComponent`.

BTW, `BodyComponentMock`'s constructor also hides its fake dependency from its dependants, just as the `public static create()` function does.

## View

A "view" refers to a function whose name ends with "View" and which returns a set of HTML elements, without owning them.

```TypeScript
import { E } from '@selfage/element/factory';

function createHomeView(): HTMLDivElement {
  return E.div(
    {
      class: "home-container",
      style: "display: flex;"
    },
    E.text("Hello!")
  );
}
```

## Controller

A "controller" is a class whose name ends with "Controller" and which takes HTML elements as input without owning them.

```TypeScript
class CommonInputController {
  public constructor(private input: HTMLInputElement) {}
}
```

## Custom events

Similar to the use of HTML events, as one of the [design patterns], you can trigger constum events in a component or a controller, to be handled by other components or controllers.

Below is the partial implementation of `TextInputController` from `@selfage/element/text_input_controller`, which triggers `enter` event when users press 'enter' key.

```TypeScript
import EventEmitter = require("events");

export declare interface TextInputController {
  on(event: "enter", listener: () => Promise<void> | void): this;
}

export class TextInputController extends EventEmitter {
  public constructor(private input: HTMLInputElement) {
    super();
  }

  public static create(input: HTMLInputElement): TextInputController {
    return new TextInputController(input).init();
  }

  public init(): this {
    this.input.addEventListener("keydown", this.keydown);
    return this;
  }

  public keydown = (event: KeyboardEvent): void => {
    if (event.code !== "Enter") {
      return;
    }
    this.emit("enter");
  };
}
```

`events` is a Nodejs package, which will be polyfilled to be run in browsers, if bundled by `@selfage/bundler_cli` or `browserify`.

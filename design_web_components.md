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

Then add a static `create()` function as the factory method to instantiate this class, taking whatever arguments needed. And more importantly, add a static `createView()` function to be called within `create()`, which creates a DOM tree that may be modified and may accept user input.

```TypeScript
import { E } from '@selfage/element/factory';

class ChatHistoryComponent {
  public constructor(public body: HTMLDivElement, private button: HTMLButtonElement, private limit: number) {}

  public static create(value: string, limit: number): ChatHistoryComponent {
    return new ChatHistoryComponent(...ChatHistoryComponent.createView(value), limit);
  }

  public static createView(value: string) {
    let buttonRef = new Ref<HTMLButtonElement>();
    let body = E.div(
      {
        class: "some-body",
        style: "display: flex; justify-content: center;"
      },
      E.div(
        {
          class: "some-text"
        },
        E.text(value)
      ),
      E.buttonRef(,
        buttonRef,
        {
          class: "some-button"
        },
        E.text("Try click!")
      )
    );
    return [body, buttonRef.val] as const;
  }
}
```

Note the use of `as const` and the spread operator `...ChatHistoryComponent.createView()`, which saves some typing to assign return values to the constructor.

Following the pattern of dependency injection, an `init()` function can be added if you need to do more than just value assignments when instantiating the class.

```TypeScript
class ChatHistoryComponent {
  // ...
  public static create(value: string, limit: number): ChatHistoryComponent {
    return new ChatHistoryComponent(...ChatHistoryComponent.createView(value), limit).init();
  }
  //...
  public init(): this {
    // E.g., register events.
    return this;
  }
}
```

### Mock component

You might be wondering why `createView()` should be separated from `create()`. It's because we want to mock everything about the class except for its DOM tree.

```TypeScript
class ChatHistoryComponentMock {
  public constructor() {
    super(ChatHistoryComponent.createView("Testing value"), undefined);
  }
}
```

Unlike normal classes interactions, DOM trees heavily depend on their parents, not just the immediate parent, but also multiple levels of parents. So we should test DOM trees composiiton as integration tests. You can see more about creating and using mocks in the [testing tutorial].

### Compose components

If you have followed the pattern above, composing components is as easy as appending their bodies to parent elements.

```TypeScript
import { E } from '@selfage/element/factory';

let homeComponent = HomeComponent.create(/* ... */);
let chatHistoryComponent = ChatHistoryComponent.create("Hello", "limit");

document.body.appendChild(
  E.div(
    {
      class: "main-container",
    },
    homeComponent.body,
    chatHistoryComponent.body,
  )
);
```

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

Or a `public static createView()` function as seen above when creating a component.

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

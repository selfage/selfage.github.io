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

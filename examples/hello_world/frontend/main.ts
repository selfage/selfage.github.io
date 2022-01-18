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

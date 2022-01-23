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

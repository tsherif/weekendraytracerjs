Weekend Ray Tracer JS
=====================

This is a JavaScript port of the path tracing algorithm described in Peter Shirley's [Ray Tracing in One Weekend](https://www.amazon.com/Ray-Tracing-Weekend-Minibooks-Book-ebook/dp/B01B5AODD8/).

The live demo can be viewed [here]().

Some key changes were made from the original algorithm to make it easier to run in a web page:
- The image is rendered to a canvas, rather than creating a ppm file.
- Instead of iterating over each pixel once and taking multiple samples per pixel, this implementation iterates over the pixels several times, taking one sample per pass. This allows something to be drawn after each pass, with a rough image gradually clearing up as more samples are taken.
- [glMatrix](http://glmatrix.net/) is used for vector calculations to avoid garbage collection.
- Other minor reorganization to account for differences between C++ and JavaScript.

Other than those differences, the algorithm *should* be functionally identical.

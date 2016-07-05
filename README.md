Weekend Ray Tracer JS
=====================

This is a JavaScript port of the path tracing algorithm described in Peter Shirley's [Ray Tracing in One Weekend](https://www.amazon.com/Ray-Tracing-Weekend-Minibooks-Book-ebook/dp/B01B5AODD8/).

The live demo can be viewed [here](https://tsherif.github.io/weekendraytracerjs/). The resolution of the rendered image can be adjusted by adding a parameter `?scale=<factor>` to the URL, indicating the scale factor relative to the window size. The render loop uses `setTimeout` rather than `requestAnimationFrame`, so it can continue rendering in a background tab. Note that the UI will be unresposive during each pass. Time permitting, I'll try to remedy this in the future by splitting each pass into asynchronous parts.

Some key changes were made to the original algorithm to make it easier to run in a browser:
- The image is rendered to a canvas, rather than creating a ppm file.
- Instead of iterating over each pixel once and taking multiple samples per pixel, this implementation iterates over the pixels several times, taking one sample per pass. This allows the image to be updated after each pass, with a rough image gradually clearing up as more samples are taken.
- [glMatrix](http://glmatrix.net/) is used for vector calculations to avoid garbage collection.
- Other minor reorganization to account for differences between C++ and JavaScript.

Other than those differences, the algorithm *should* be functionally identical to the original. If you find any errors, please let me know!

///////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)
//
// Copyright (c) 2016 Tarek Sherif
// Based on the original algorithm by Peter Shirley
// (http://in1weekend.blogspot.ca/2016/01/ray-tracing-in-one-weekend.html)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

// Based on the original algorithm by Peter Shirley
// (http://in1weekend.blogspot.ca/2016/01/ray-tracing-in-one-weekend.html)
(function() {
    "use strict";

    var spheres = [];

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    var scale = (function() {
        var s = 0.25;

        var params = location.search.slice(1).split("&");

        for (var i = 0; i < params.length; i++) {
            var parts = params[i].split("=");

            if (parts[0] === "scale") {
                s = parseFloat(parts[1]);
            }
        }

        return s;
    })();

    var aspect = windowWidth / windowHeight;

    var canvasWidth = Math.floor(windowWidth * scale);
    var canvasHeight = Math.floor(windowHeight * scale);

    function randomScene() {
        spheres.push(new Sphere([0, -1000, -1], 1000, new Lambertian([0.5, 0.5, 0.5])));

        var tmp = vec3.fromValues(4, 0.2, 0);
        var diff = vec3.create();

        for (var a = -11; a < 11; a += 3) {
            for (var b = -11; b < 11; b += 3) {

                var radius = 0.2;
                var center = vec3.create();
                vec3.set(center, a + 0.9 * Math.random(), radius, b + 0.9 * Math.random());
                vec3.sub(diff, center, tmp);

                if (vec3.length(diff) > 0.9) {

                    var mat = Math.random();

                    if (mat < 0.7) {
                        spheres.push(
                            new Sphere(
                                center,
                                radius,
                                new Lambertian([
                                    Math.random() * Math.random(),
                                    Math.random() * Math.random(),
                                    Math.random() * Math.random()
                                ])
                            )
                        );
                    } else if (mat < 0.9) {
                        spheres.push(
                            new Sphere(
                                center,
                                radius,
                                new Metal(
                                    [
                                        0.5 * (1 + Math.random()),
                                        0.5 * (1 + Math.random()),
                                        0.5 * (1 + Math.random())
                                    ],
                                    0.5 * Math.random()
                                )
                            )
                        );
                    } else {
                        spheres.push(
                            new Sphere(
                                center,
                                radius,
                                new Dielectric(1.5)
                            )
                        );
                    }
                }
            }
        }

        spheres.push(
            new Sphere(
                [0, 1, 0],
                1,
                new Dielectric(1.5)
            )
        );

        spheres.push(
            new Sphere(
                [-4, 1, 0],
                1,
                new Lambertian([0.4, 0.1, 0.1])
            )
        );

        spheres.push(
            new Sphere(
                [4, 1, 0],
                1,
                new Metal(
                    [
                        0.7,
                        0.7,
                        0.7
                    ],
                    0
                )
            )
        );
    }

    function createHitRecord() {
        return {
            t: 0,
            p: vec3.create(),
            n: vec3.create(),
            material: null
        };
    }

    var tempHitRecord = createHitRecord();

    function hit(r, tmin, tmax, hitRecord) {
        var hitSomething = false;
        var closestT = tmax;
        for (var i = 0, len = spheres.length; i < len; i++) {
            if (spheres[i].hit(r, tmin, closestT, tempHitRecord) > 0.0) {
                if (tempHitRecord.t < closestT) {
                    hitRecord.t = tempHitRecord.t;
                    vec3.copy(hitRecord.p, tempHitRecord.p);
                    vec3.copy(hitRecord.n, tempHitRecord.n);
                    hitRecord.material = tempHitRecord.material;
                    closestT = hitRecord.t;
                    hitSomething = true;
                }

            }
        }

        return hitSomething;
    }

    var color1 = vec3.fromValues(1.0, 1.0, 1.0);
    var color2 = vec3.fromValues(0.5, 0.7, 1.0);
    var col1 = vec3.create();
    var col2 = vec3.create();

    var hitRecord = createHitRecord();

    function color(r, result, depth) {
        var attenuation = vec3.create();

        if (hit(r, 0.001, Number.MAX_VALUE, hitRecord)) {
            if (depth < 50) {

                if (hitRecord.material.scatter(r, attenuation, hitRecord)) {
                    color(r, result, depth + 1);
                    vec3.mul(result, result, attenuation);

                    return;
                }
            }

            vec3.set(result, 0.0, 0.0, 0.0);
            return;
        }

        var unitDir = vec3.create();
        vec3.copy(unitDir, r.dir);
        vec3.normalize(unitDir, unitDir);

        var t = 0.5 * unitDir[1] + 0.5;

        vec3.copy(col1, color1);
        vec3.scale(col1, col1, 1.0 - t);

        vec3.copy(col2, color2);
        vec3.scale(col2, col2, t);

        vec3.add(result, col1, col2);
    }

    window.onload = function() {
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");

        var nx = canvas.width = canvasWidth;
        var ny = canvas.height = canvasHeight;

        var img = context.getImageData(0, 0, nx, ny);
        var pixels = img.data;
        var numPixels = pixels.length / 4;

        var accumulator = new Float32Array(numPixels * 3);

        var col = vec3.create();

        randomScene();

        var cam = new Camera(
            vec3.fromValues(14, 2, 6),
            vec3.fromValues(0, 0, 0),
            vec3.fromValues(0, 1, 0),
            Math.PI / 9,
            aspect,
            12,
            0.1
        );

        var r = new Ray();

        var k = 1;

        var passInfo = document.getElementById("pass");
        var timeInfo = document.getElementById("time");
        var canvasResInfo = document.getElementById("canvas-resolution");
        var windowResInfo = document.getElementById("window-resolution");

        canvasResInfo.innerText = canvas.width + "x" + canvas.height;
        windowResInfo.innerText = window.innerWidth + "x" + window.innerHeight;

        window.addEventListener("resize", function() {
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;

            aspect = windowWidth / windowHeight;

            cam = new Camera(
                vec3.fromValues(14, 2, 6),
                vec3.fromValues(0, 0, 0),
                vec3.fromValues(0, 1, 0),
                Math.PI / 9,
                aspect,
                12,
                0.1
            );

            canvasWidth = Math.floor(windowWidth * scale);
            canvasHeight = Math.floor(windowHeight * scale);

            nx = canvas.width = canvasWidth;
            ny = canvas.height = canvasHeight;

            img = context.getImageData(0, 0, nx, ny);
            pixels = img.data;
            numPixels = pixels.length / 4;

            accumulator = new Float32Array(numPixels * 3);

            k = 1;

            canvasResInfo.innerText = canvas.width + "x" + canvas.height;
            windowResInfo.innerText = window.innerWidth + "x" + window.innerHeight;
        });

        setTimeout(function render() {
            setTimeout(render);

            var startTime = Date.now();

            for (var j = 0; j < ny; j++) {
                for (var  i = 0; i < nx; i++) {

                    var u = (i + Math.random()) / nx;
                    var v = (j + Math.random()) / ny;

                    cam.getRay(r, u, v);

                    color(r, col, 0);

                    var index = ((ny - j - 1) * nx + i) * 3;

                    accumulator[index    ] += col[0];
                    accumulator[index + 1] += col[1];
                    accumulator[index + 2] += col[2];

                }
            }

            for (var p = 0; p < numPixels; p++) {
                var pi = p * 4;
                var ai = p * 3;

                pixels[pi    ] = Math.floor(Math.sqrt(accumulator[ai] / k) * 255.99);
                pixels[pi + 1] = Math.floor(Math.sqrt(accumulator[ai + 1] / k) * 255.99);
                pixels[pi + 2] = Math.floor(Math.sqrt(accumulator[ai + 2] / k) * 255.99);
                pixels[pi + 3] = 255;
            }

            context.putImageData(img, 0, 0);
            passInfo.innerText = ++k;
            timeInfo.innerText = ((Date.now() - startTime) / 1000).toPrecision(2) + "s";
        });

    };


})();

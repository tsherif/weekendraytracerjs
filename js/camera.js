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

(function() {
    "use strict";

    var hor = vec3.create();
    var vert = vec3.create();
    var hwu = vec3.create();
    var hhv = vec3.create();
    var fw = vec3.create();

    window.Camera = function Camera(eye, look, up, vfov, aspect, focusDist, aperture) {
        this.origin = vec3.create();
        this.lowerLeft = vec3.create();
        this.horizontal = vec3.create();
        this.vertical = vec3.create();
        this.u = vec3.create();
        this.v = vec3.create();
        this.w = vec3.create();
        this.lensRadius = aperture / 2;

        var halfHeight = Math.tan(vfov / 2.0);
        var halfWidth = halfHeight * aspect;

        vec3.sub(this.w, eye, look);
        vec3.normalize(this.w, this.w);

        vec3.cross(this.u, up, this.w);
        vec3.normalize(this.u, this.u);

        vec3.cross(this.v, this.w, this.u);

        vec3.copy(hwu, this.u);
        vec3.scale(hwu, hwu, halfWidth * focusDist);

        vec3.copy(hhv, this.v);
        vec3.scale(hhv, hhv, halfHeight * focusDist);

        vec3.copy(fw, this.w);
        vec3.scale(fw, fw, focusDist);

        vec3.copy(this.origin, eye);

        vec3.copy(this.lowerLeft, eye);
        vec3.sub(this.lowerLeft, this.lowerLeft, hwu);
        vec3.sub(this.lowerLeft, this.lowerLeft, hhv);
        vec3.sub(this.lowerLeft, this.lowerLeft, fw);

        vec3.copy(this.horizontal, hwu);
        vec3.scale(this.horizontal, this.horizontal, 2.0);

        vec3.copy(this.vertical, hhv);
        vec3.scale(this.vertical, this.vertical, 2.0);
    }

    var offset = vec3.create();
    var offsetu = vec3.create();
    var offsetv = vec3.create();

    Camera.prototype.getRay = function(r, u, v) {

        randomInUnitDisk(offset);
        vec3.scale(offset, offset, this.lensRadius);
        vec3.copy(offsetu, this.u);
        vec3.scale(offsetu, offsetu, offset[0]);
        vec3.copy(offsetv, this.v);
        vec3.scale(offsetv, offsetv, offset[1]);


        vec3.copy(r.origin, this.origin);
        vec3.add(r.origin, r.origin, offsetu);
        vec3.add(r.origin, r.origin, offsetv);

        vec3.copy(hor, this.horizontal);
        vec3.scale(hor, hor, u);

        vec3.copy(vert, this.vertical);
        vec3.scale(vert, vert, v);

        vec3.copy(r.dir, this.lowerLeft);
        vec3.add(r.dir, r.dir, hor);
        vec3.add(r.dir, r.dir, vert);
        vec3.sub(r.dir, r.dir, this.origin);
        vec3.sub(r.dir, r.dir, offsetu);
        vec3.sub(r.dir, r.dir, offsetv);
    };

    function randomInUnitDisk(p) {
    do {
        vec3.set(p, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, 0.0);
    } while (vec3.dot(p, p) >= 1.0);
}

})();


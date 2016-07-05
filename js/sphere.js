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
    window.Sphere = function Sphere(center, radius, material) {
        this.center = center || vec3.create();
        this.radius = radius || 1;
        this.material = material || new Lambertian();
    };

    var oc = vec3.create();

    Sphere.prototype.hit = function(r, tmin, tmax, hitRecord) {
        vec3.sub(oc, r.origin, this.center);
        var a = vec3.dot(r.dir, r.dir);
        var b = 2.0 * vec3.dot(oc, r.dir);
        var c = vec3.dot(oc, oc) - this.radius * this.radius;
        var discriminant = b * b - 4 * a * c;
        if (discriminant > 0) {
            var temp = (-b - Math.sqrt(discriminant)) / (2.0 * a);

            if (temp >= tmin && temp <= tmax) {
                hitRecord.t = temp;
                r.pointAtParameter(hitRecord.p, hitRecord.t);
                vec3.sub(hitRecord.n, hitRecord.p, this.center);
                vec3.scale(hitRecord.n, hitRecord.n, 1.0 / this.radius);
                hitRecord.material = this.material;
                return true;
            }

            temp = (-b + Math.sqrt(discriminant)) / (2.0 * a);

            if (temp >= tmin && temp <= tmax) {
                hitRecord.t = temp;
                r.pointAtParameter(hitRecord.p, hitRecord.t);
                vec3.sub(hitRecord.n, hitRecord.p, this.center);
                vec3.scale(hitRecord.n, hitRecord.n, 1.0 / this.radius);
                hitRecord.material = this.material;
                return true;
            }
        }

        return false;
    }

})();

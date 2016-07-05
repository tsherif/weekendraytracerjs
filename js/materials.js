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

    window.Lambertian = function Lambertian(albedo) {
        this.albedo = albedo || vec3.fromValues(1.0, 1.0, 1.0);
    };

    var target = vec3.create();

    Lambertian.prototype.scatter = function(r, attenuation, hitRecord) {
        vec3.copy(attenuation, this.albedo);

        randomInUnitSphere(target);
        vec3.add(target, target, hitRecord.p);
        vec3.add(target, target, hitRecord.n);

        vec3.copy(r.origin, hitRecord.p);
        vec3.sub(r.dir, target, hitRecord.p);

        return true;
    };

    window.Metal = function Metal(albedo, fuzz) {
        this.albedo = albedo || vec3.fromValues(1.0, 1.0, 1.0);
        this.fuzz = fuzz || 0;
    }

    var incident = vec3.create();
    var fuzzVec = vec3.create();

    Metal.prototype.scatter = function(r, attenuation, hitRecord) {
        vec3.copy(attenuation, this.albedo);

        vec3.copy(incident, r.dir);
        vec3.normalize(incident, incident);

        vec3.copy(r.origin, hitRecord.p);
        reflect(r.dir, incident, hitRecord.n);

        if (this.fuzz > 0) {
            randomInUnitSphere(fuzzVec);
            vec3.scale(fuzzVec, fuzzVec, this.fuzz);
            vec3.add(r.dir, r.dir, fuzzVec);
        }

        return (vec3.dot(r.dir, hitRecord.n) > 0.0);
    };

    window.Dielectric = function Dielectric(snell) {
        this.snell = snell;
    }

    var outNormal = vec3.create();

    Dielectric.prototype.scatter = function(r, attenuation, hitRecord) {
        vec3.set(attenuation, 1, 1, 1);

        vec3.copy(outNormal, hitRecord.n);

        var snell, cosine, reflectProb;

        if (vec3.dot(r.dir, hitRecord.n) > 0) {
            vec3.scale(outNormal, outNormal, -1.0);
            snell = hitRecord.material.snell;
            cosine = vec3.dot(r.dir, hitRecord.n) / vec3.length(r.dir);
        } else {
            snell = 1.0 / hitRecord.material.snell;
            cosine = -vec3.dot(r.dir, hitRecord.n) / vec3.length(r.dir);
        }

        vec3.copy(r.origin, hitRecord.p);
        if (refract(r.dir, r.dir, outNormal, snell)) {
            reflectProb = schlick(cosine, snell);
        } else {
            reflectProb = 1.0;
        }

        if (Math.random() < reflectProb) {
            reflect(r.dir, r.dir, hitRecord.n);
        }

        return true;
    };

    function schlick(cosine, snell) {
        var r0 = (1.0 - snell) / (1.0 + snell);
        r0 = r0 * r0;
        return r0 + (1.0 - r0) * Math.pow(1.0 - cosine, 5.0);
    }

    var tmpI = vec3.create();
    var tmpN = vec3.create();

    function refract(out, incident, normal, snell) {
        vec3.copy(tmpI, incident);
        vec3.normalize(tmpI, tmpI);
        vec3.copy(tmpN, normal);
        vec3.normalize(tmpN, tmpN);

        var dt = vec3.dot(tmpI, tmpN);
        var discriminant = 1.0 - snell * snell * (1.0 - dt * dt);

        if (discriminant > 0.0) {
            vec3.scale(tmpI, tmpI, snell);
            vec3.scale(tmpN, tmpN, snell * dt + Math.sqrt(discriminant));

            vec3.sub(out, tmpI, tmpN);
            return true;
        }

        return false;
    }

    function reflect(out, incident, normal) {
        vec3.copy(tmpI, incident);
        vec3.copy(tmpN, normal);

        vec3.scale(tmpN, tmpN, 2.0 * vec3.dot(tmpI, tmpN));
        vec3.sub(out, tmpI, tmpN);
    }


    function randomInUnitSphere(p) {
        do {
            vec3.set(p, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0);
        } while (vec3.dot(p, p) >= 1.0);
    }

})();



/*
    oD = objectDistance
    oH = objectHeight
    iD = imageDistance
    iH = imageHeight
    f = focal length
    M = Magnification

    M = (-iD)/oD
    oD/iD = oH/iH = f/(iD-f)
    1/f = (1/oD) + (1/iD)
    f = 1 / ((1/oD) + (1/iD))
    f = (oH * iD) / (oH + iH)
    oD = 1 / ((1/f) - (1/iD))
    iD = 1 / ((1/f) - (1/oD))
    iH = (oH*iD) / oD
    oH = (oD/iD) * iH
*/
class tl{
    static rad2deg(radians) {
        return radians * (180/Math.PI);
    }
    static deg2rad(degrees) {
        return degrees * (Math.PI/180);
    }
    static Mag(imageDistance,objectDistance) {
        return -imageDistance/objectDistance;
    }
    static focalLength(objectDistance,imageDistance) {
        return 1/((1/objectDistance) + (1/imageDistance));
    }
    static rDistance(distance,focalLength) {
        return 1/((1/focalLength)-(1/distance));
    }
    static angularSize(span,distance) {
        return this.rad2deg(2*Math.atan(span/(2*distance)));
    }
    static occlusionDistance(span,angle){
        return span/(2*Math.tan(this.deg2rad(angle)/2));
    }
    static span(distance, angle) {
        return 2 * distance * Math.tan(this.deg2rad(angle) / 2);
    }
}


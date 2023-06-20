const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const centerX = canvas.width/2;
const centerY = canvas.height/2;

function degrees(radians) {
    return radians * (180 / Math.PI);
}

function radians(degrees) {
    return degrees * (Math.PI/180);
}

function drawGrid(scale) {
    // scale in pixels/mm
    var spacing = 10 * scale;
    if (spacing <= 20) {
        spacing = spacing * 10
    }
    const xcount = Math.ceil(canvas.width / spacing);
    const ycount = Math.ceil(canvas.height / spacing);
    const xOffset = (canvas.width - (xcount * spacing)) / 2;
    const yOffset = (canvas.height - (ycount * spacing)) / 2;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#050505";
    ctx.beginPath();
    for (let x = 0; x < xcount; x++) {
        ctx.moveTo(x * spacing + xOffset, 0 + yOffset);
        ctx.lineTo(x * spacing + xOffset, canvas.height - yOffset);
    }
    for (let y = 0; y < ycount; y++) {
        ctx.moveTo(0 + xOffset, y * spacing + yOffset);
        ctx.lineTo(canvas.width - xOffset, y * spacing + yOffset);
    }
    ctx.stroke();
}

function drawScreen(x,y,width,height){
    ctx.fillStyle = "#0A0A0A";
    const newX = x-(width/2);
    const newY = y-(height/2);
    ctx.fillRect(newX-1,newY-1,width+2,height+2);
    ctx.fillStyle = "#7f8385";
    ctx.fillRect(newX,newY,width,height);
}

function drawEye(x,y,width,height){
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#FF0000";
    ctx.beginPath();
    ctx.moveTo(x-Math.min(width,height)/4,y);
    ctx.lineTo(x+Math.min(width,height)/4,y);
    ctx.moveTo(x,y-Math.min(width,height)/4);
    ctx.lineTo(x,y+Math.min(width,height)/4);
    ctx.stroke();
}

function updateOutputs() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const resx = parseFloat(document.getElementById('resx').value);
    const resy = parseFloat(document.getElementById('resy').value);
    const IPD = parseFloat(document.getElementById('IPD').value);
    const dualoffset = parseFloat(document.getElementById('dualoffset').value);
    const divider = parseFloat(document.getElementById('divider').value);
    const lensD = parseFloat(document.getElementById('lensD').value);
    const lensF = parseFloat(document.getElementById('lensF').value);
    const lensT = parseFloat(document.getElementById('lensT').value);
    const desiredFocus = parseFloat(document.getElementById('desiredFocus').value);
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const sweetFOV = parseFloat(document.getElementById('sweetFOV').value);
    const pixWidth = width / resx;
    const pixHeight = height / resy;
    const lensO = Math.round((-1 / ((1 / -lensF) - (1 / desiredFocus))) / tolerance) * tolerance;
    const virtualPlane = -1 / (1/lensF - 1/lensO);
    const magnification = lensF / (lensF - lensO);
    const verticalFOV = degrees(2 * Math.atan((magnification * (height / 2)) / virtualPlane));
    //const verticalFOV = degrees( 2 * Math.atan(height/(2*lensF)))
    var pixelLoss = 0;
    var temporal = 0;
    var nasal = 0;
    if (mode == "single"){
        pixelLoss = (divider/pixWidth).toFixed(2);
        temporal = degrees(Math.atan((magnification * ((width - IPD) / 2)) / virtualPlane));
        nasal = degrees(Math.atan((magnification * ((IPD - divider) / 2)) / virtualPlane));
    } else {
        pixelLoss = 0;
        temporal = degrees(Math.atan((magnification * ((width/2) + dualoffset)) / virtualPlane));
        nasal = degrees(Math.atan((magnification * ((width/2) - dualoffset)) / virtualPlane));
    }
    const oneEye = nasal + temporal
    const monoFOV = temporal*2
    const binoFOV = nasal*2
    const monoCutoff = (lensD/2) / Math.tan(radians(temporal))
    const binoCutoff = (lensD/2) / Math.tan(radians(nasal))
    const vertCutoff = (lensD/2) / Math.tan(radians(verticalFOV/2))
    const ideal = Math.min(binoCutoff,monoCutoff,vertCutoff)
    const sweetD = 2 * lensF * Math.tan(radians(sweetFOV/2))
    var ppdhorizontal = 0;
    if (mode == "single"){
        ppdhorizontal = ((resx - (divider/pixWidth))/2)/(oneEye)
    } else {
        ppdhorizontal = resx/oneEye
    }
    const ppdvertical = resy/verticalFOV
    const sweetPPDhorizontal = (sweetD/pixWidth)/sweetFOV
    const sweetPPDvertical = (sweetD/pixHeight)/sweetFOV
    const eyeScreenOffset = lensO + ideal
    const diagFOV = degrees(Math.sqrt(radians(oneEye) ** 2 + radians(verticalFOV) ** 2))
    const diagCutoff = (lensD/2) / Math.tan(radians(diagFOV/2))
    //Background Fill
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 800, 605);
    ctx.fillStyle = "#DDDDDD";
    ctx.fillRect(2, 2, 796, 601);
    const ratio = width/height;
    const doubleRatio = (width+(dualoffset*2)+IPD)/height;
    var pixelFactor = 0;
    var newWidth = 0;
    var newHeight = 0;
    var scaleIPD = 0;
    if (mode == "single"){
        //Single Screen
        if (ratio >= 800/605){
            newWidth = 720;
            newHeight = 720/ratio;
        } else { 
            newWidth = 545*ratio;
            newHeight = 545;
        }
        pixelFactor = newHeight/height;
        scaleIPD = IPD*pixelFactor;
        drawGrid(pixelFactor);
        drawScreen(centerX,centerY,newWidth,newHeight);
        drawEye(centerX-(scaleIPD/2),centerY,newWidth,newHeight);
        drawEye(centerX+(scaleIPD/2),centerY,newWidth,newHeight);
        //Divider
        ctx.fillStyle = "#000000";
        ctx.fillRect(centerX-(divider/2*pixelFactor),centerY-newHeight/2,divider*pixelFactor,newHeight);
    } else {
        //Dual Screen
        if (doubleRatio >= 800/605){
            pixelFactor = (720/doubleRatio)/height;
        } else { 
            pixelFactor = (545*doubleRatio)/(width+IPD+(dualoffset*2));
        }
        newWidth = width*pixelFactor;
        newHeight = height*pixelFactor;
        scaleIPD = IPD*pixelFactor;
        drawGrid(pixelFactor);
        drawScreen(centerX-(scaleIPD/2)-(dualoffset*pixelFactor),centerY,newWidth,newHeight);
        drawScreen(centerX+(scaleIPD/2)+(dualoffset*pixelFactor),centerY,newWidth,newHeight);
        drawEye(centerX-(scaleIPD/2),centerY,newWidth,newHeight);
        drawEye(centerX+(scaleIPD/2),centerY,newWidth,newHeight);
    }
    const scaleMono = pixelFactor*(lensF * Math.tan(radians(monoFOV/2)))
    const scaleBino = pixelFactor*(lensF * Math.tan(radians(binoFOV/2)))
    const scaleVert = pixelFactor*(lensF * Math.tan(radians(verticalFOV/2)))
    const scaleDiag = pixelFactor*(lensF * Math.tan(radians(diagFOV/2)))
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.strokeStyle = "#ff00ff";
    ctx.arc(centerX-(scaleIPD/2),centerY,scaleMono,0,2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX+(scaleIPD/2),centerY,scaleMono,0,2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "#ffff00";
    ctx.arc(centerX-(scaleIPD/2),centerY,scaleBino,0,2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX+(scaleIPD/2),centerY,scaleBino,0,2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "#00ffff";
    ctx.arc(centerX-(scaleIPD/2),centerY,scaleVert,0,2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX+(scaleIPD/2),centerY,scaleVert,0,2*Math.PI);
    ctx.stroke();/*
    ctx.beginPath();
    ctx.strokeStyle = "#00ff00";
    ctx.arc(centerX-(scaleIPD/2),centerY,scaleDiag,0,2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX+(scaleIPD/2),centerY,scaleDiag,0,2*Math.PI);
    ctx.stroke();*/
    document.getElementById('pixelDimensions').value = pixWidth.toFixed(3)*1000 + "x" + pixHeight.toFixed(3)*1000;
    document.getElementById('pixelLoss').value = pixelLoss + "px";
    document.getElementById('focalPlane').value = virtualPlane.toFixed(2);
    document.getElementById('magnification').value = magnification.toFixed(2);
    document.getElementById('idealRelief').value = ideal.toFixed(2);
    document.getElementById('lensO').value = lensO.toFixed(2);
    document.getElementById('eyeScreen').value = eyeScreenOffset.toFixed(2);
    document.getElementById('monoFOV').value = monoFOV.toFixed(2);
    document.getElementById('binoFOV').value = binoFOV.toFixed(2);
    document.getElementById('vertFOV').value = verticalFOV.toFixed(2);
    document.getElementById('oneEyeFOV').value = oneEye.toFixed(2);
    document.getElementById('diagFOV').value = diagFOV.toFixed(2);
    document.getElementById('temporal').value = temporal.toFixed(2);
    document.getElementById('nasal').value = nasal.toFixed(2);
    document.getElementById('sweetD').value = sweetD.toFixed(2);
    document.getElementById('monoCutoff').value = monoCutoff.toFixed(2);
    document.getElementById('binoCutoff').value = binoCutoff.toFixed(2);
    document.getElementById('vertCutoff').value = vertCutoff.toFixed(2);
    document.getElementById('diagCutoff').value = diagCutoff.toFixed(2);
    document.getElementById('ppdHorizontal').value = ppdhorizontal.toFixed(2);
    document.getElementById('ppdVertical').value = ppdvertical.toFixed(2);
    document.getElementById('ppdSweetHorizontal').value = sweetPPDhorizontal.toFixed(2);
    document.getElementById('ppdSweetVertical').value = sweetPPDvertical.toFixed(2);
}

updateOutputs();
var radioButtons = document.querySelectorAll('input[name="mode"]');
radioButtons.forEach(function(radioButton) {
    radioButton.addEventListener('change', updateOutputs);
});
const inputs = document.querySelectorAll('.input-group input');
inputs.forEach((input) => {
    input.addEventListener('input', updateOutputs);
});
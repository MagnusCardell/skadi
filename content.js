const skadiColors = {
    background: '#282a36',
    currentLine: '#44475a',
    selection: '#44475a',
    foreground: '#dfdfd9',
    comment: '#6272a4',
    cyan: '#8be9fd',
    green: '#50fa7b',
    orange: '#ffb86c',
    pink: '#ff79c6',
    purple: '#bd93f9',
    red: '#ff5555',
    yellow: '#f1fa8c'
};

function rgbToXyz(r, g, b) {
    // Convert RGB to [0, 1] range
    r /= 255; g /= 255; b /= 255;

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert RGB to XYZ
    const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
    const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
    const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;

    return [x, y, z];
}

function xyzToLab(x, y, z) {
    // D65 reference white
    const xRef = 95.047;
    const yRef = 100.000;
    const zRef = 108.883;

    // Convert XYZ to XYZ / Reference white
    x /= xRef; y /= yRef; z /= zRef;

    // F(t) function
    const f = t => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + (16/116);

    x = f(x); y = f(y); z = f(z);

    // Convert to Lab
    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);

    return [l, a, b];
}

function rgbToLab(r, g, b) {
    const [x, y, z] = rgbToXyz(r, g, b);
    return xyzToLab(x, y, z);
}

function colorDistance(color1, color2) {
    const deltaL = color1.L - color2.L;
    const deltaA = color1.A - color2.A;
    const deltaB = color1.B - color2.B;
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

function mapToSkadiColor(originalColor, isBackground = false) {
    const originalLAB = rgbToLab(originalColor);
    let closestColor = null;
    let closestDistance = Infinity;

    const darkSkadiColors = [
        skadiColors.background,
        skadiColors.currentLine,
        skadiColors.selection,
        skadiColors.comment
    ];

    const colorPool = isBackground ? darkSkadiColors : Object.values(skadiColors);

    for (const skadiColor of colorPool) {
        const skadiLAB = rgbToLab(skadiColor);
        const distance = colorDistance(originalLAB, skadiLAB);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestColor = skadiColor;
        }
    }

    const someLuminanceThreshold = 75;
    if (isBackground && originalLAB.L > someLuminanceThreshold) {
        return skadiColors.comment; 
    }

    return closestColor;
}

function enableSkadi() {
    const style = document.createElement('style');
    document.head.append(style);
    
    style.textContent = `
        html, body {
            background-color: ${skadiColors.background} !important;
            color: ${skadiColors.foreground} !important;
        }
    `;

    document.querySelectorAll('*').forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        
        const backgroundColor = computedStyle.backgroundColor;
        el.style.backgroundColor = mapToSkadiColor(backgroundColor, true);
        
        const color = computedStyle.color;
        if (color) {
            el.style.color = mapToSkadiColor(color);
        }
    });
    //const style = document.createElement('style');
    //style.textContent = `
    //    body {
    //        filter: invert(1) hue-rotate(180deg);
    //        background-color: "black";
    //    }
    //  img, picture, video {
    //        filter: invert(1) hue-rotate(180deg);
    //    }
    //`;
    document.head.append(style);
}

enableSkadi();


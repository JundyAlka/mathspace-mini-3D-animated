/**
 * src/math.js
 * Contains all mathematical calculation functions for volume and surface area.
 */

const PI = Math.PI;

/**
 * Validates a number input.
 * @param {number} value - The value to validate.
 * @returns {number} The validated value, or a default if invalid.
 */
function validateInput(value) {
    const min = 0.1;
    const max = 10000;
    let num = parseFloat(value);

    if (isNaN(num) || num < min) {
        return min;
    }
    if (num > max) {
        return max;
    }
    return num;
}

/**
 * Rounds a number to 2 decimal places.
 * @param {number} value - The number to round.
 * @returns {number} The rounded number.
 */
function roundToTwoDecimals(value) {
    return Math.round(value * 100) / 100;
}

// --- Kubus (Cube) ---

function volumeKubus(s) {
    s = validateInput(s);
    return roundToTwoDecimals(s * s * s);
}

function luasKubus(s) {
    s = validateInput(s);
    return roundToTwoDecimals(6 * s * s);
}

// --- Balok (Box/Rectangular Prism) ---

function volumeBalok(p, l, t) {
    p = validateInput(p);
    l = validateInput(l);
    t = validateInput(t);
    return roundToTwoDecimals(p * l * t);
}

function luasBalok(p, l, t) {
    p = validateInput(p);
    l = validateInput(l);
    t = validateInput(t);
    // 2(pl + pt + lt)
    return roundToTwoDecimals(2 * (p * l + p * t + l * t));
}

// --- Tabung (Cylinder) ---

function volumeTabung(r, t) {
    r = validateInput(r);
    t = validateInput(t);
    // V = πr²t
    return roundToTwoDecimals(PI * r * r * t);
}

function luasTabung(r, t) {
    r = validateInput(r);
    t = validateInput(t);
    // Luas Permukaan = 2πr(r + t)
    return roundToTwoDecimals(2 * PI * r * (r + t));
}

// --- Limas Segi Empat (Square Pyramid) ---

function volumeLimas(s, t) {
    s = validateInput(s);
    t = validateInput(t);
    // V = (1/3) * s² * t
    return roundToTwoDecimals((1 / 3) * s * s * t);
}

function luasLimas(s, t) {
    s = validateInput(s);
    t = validateInput(t);
    // Luas Permukaan = Luas Alas + 4 * Luas Sisi Tegak
    // Tinggi sisi tegak (slant height) = sqrt((s/2)² + t²)
    const slantHeight = Math.sqrt(Math.pow(s / 2, 2) + Math.pow(t, 2));
    const luasAlas = s * s;
    const luasSisiTegak = 4 * (0.5 * s * slantHeight);
    return roundToTwoDecimals(luasAlas + luasSisiTegak);
}

// --- Kerucut (Cone) ---

function volumeKerucut(r, t) {
    r = validateInput(r);
    t = validateInput(t);
    // V = (1/3) * πr²t
    return roundToTwoDecimals((1 / 3) * PI * r * r * t);
}

function luasKerucut(r, t) {
    r = validateInput(r);
    t = validateInput(t);
    // Luas Permukaan = πr(r + s), dimana s adalah garis pelukis
    const s = Math.sqrt(r * r + t * t);
    return roundToTwoDecimals(PI * r * (r + s));
}

// --- Prisma Segitiga (Triangular Prism) ---

function volumePrisma(a, t_alas, t_prisma) {
    a = validateInput(a);
    t_alas = validateInput(t_alas);
    t_prisma = validateInput(t_prisma);
    // V = Luas Alas * Tinggi Prisma
    const luasAlas = 0.5 * a * t_alas;
    return roundToTwoDecimals(luasAlas * t_prisma);
}

function luasPrisma(a, t_alas, t_prisma) {
    a = validateInput(a);
    t_alas = validateInput(t_alas);
    t_prisma = validateInput(t_prisma);
    // Asumsi segitiga sama sisi untuk penyederhanaan keliling, atau input sisi lain?
    // Untuk simplifikasi awal: Asumsi segitiga sama sisi untuk menghitung keliling alas
    // Luas Permukaan = (2 * Luas Alas) + (Keliling Alas * Tinggi Prisma)

    // Namun, jika hanya input alas dan tinggi, kita tidak tahu sisi miring.
    // Opsi: Minta input sisi miring, atau asumsi segitiga siku-siku/sama kaki/sama sisi.
    // Mari asumsikan segitiga sama sisi untuk saat ini agar input minimal.
    // Keliling = 3 * a

    const luasAlas = 0.5 * a * t_alas;
    const kelilingAlas = 3 * a;
    return roundToTwoDecimals((2 * luasAlas) + (kelilingAlas * t_prisma));
}

// Export functions for use in other modules
window.MathFunctions = {
    validateInput,
    volumeKubus,
    luasKubus,
    volumeBalok,
    luasBalok,
    volumeTabung,
    luasTabung,
    volumeLimas,
    luasLimas,
    volumeKerucut,
    luasKerucut,
    volumePrisma,
    luasPrisma
};


// src/lib/colors.ts

/**
 * Converte uma string de cor hexadecimal para uma string HSL.
 * @param H A cor hexadecimal (ex: #RRGGBB).
 * @returns Uma string no formato "H S% L%" (ex: "0 0% 0%").
 */
export function hexToHSL(H: string): string {
  // Converte o hexadecimal para RGB
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = parseInt("0x" + H[1] + H[1], 16);
    g = parseInt("0x" + H[2] + H[2], 16);
    b = parseInt("0x" + H[3] + H[3], 16);
  } else if (H.length === 7) {
    r = parseInt("0x" + H[1] + H[2], 16);
    g = parseInt("0x" + H[3] + H[4], 16);
    b = parseInt("0x" + H[5] + H[6], 16);
  }

  // Normaliza os valores de RGB
  r /= 255;
  g /= 255;
  b /= 255;

  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  // Calcula o Hue (H)
  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // Calcula a Lightness (L)
  l = (cmax + cmin) / 2;

  // Calcula a Saturation (S)
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
  // Multiplica por 100 para obter as porcentagens
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}

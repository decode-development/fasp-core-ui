import { APPLICATION_STATUS_URL } from "../Constants";
import pako from 'pako';

export function paddingZero(string, padStr, len) {
  var str = string.toString();
  // console.log("str.length", str.length)
  while (str.length < len)
    str = padStr + str;
  return str;
}

export function generateRandomAplhaNumericCode(length) {
  var string = Math.random().toString(36).substr(2, length);
  string = string.toUpperCase();
  // console.log("String", string);
  return string;
}

export function invertHex(hex) {
  return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
}

function rgbToYIQ({ r, g, b }) {
  return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}

function hexToRgb(hex) {
  if (!hex || hex === undefined || hex === '') {
    return undefined;
  }

  const result =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : undefined;
}

export function contrast(colorHex, threshold = 128) {
  if (colorHex === undefined) {
    return '#000';
  }

  const rgb = hexToRgb(colorHex);

  if (rgb === undefined) {
    return '#000';
  }

  return rgbToYIQ(rgb) >= threshold ? '#000' : '#fff';
}

export function isSiteOnline() {
  let loginOnline = localStorage.getItem("loginOnline");
  if (loginOnline==undefined || loginOnline.toString() == "true") {
    let url = APPLICATION_STATUS_URL;
    let request = new XMLHttpRequest;
    request.open('GET', url, false);
    try {
      request.send('');
      // console.log("@@@ in is site online")
      if (request.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}

export function decompressJson(str) {
  let value = typeof str !== "string" ? JSON.stringify(str) : str;
  try {
      JSON.parse(value);
  } catch (e) {
      // const size = new TextEncoder().encode(JSON.stringify(str)).length
      // const kiloBytes = size / 1000;
      // const megaBytes = kiloBytes / 1000;
      // console.log("Size of obj ======= ",megaBytes);
      const compressedData = atob(str);
      const byteArray = new Uint8Array(compressedData.length);
      for (let i = 0; i < compressedData.length; i++) {
        byteArray[i] = compressedData.charCodeAt(i);
      }
      const decompressedData = pako.inflate(byteArray, { to: 'string' });
      var json = JSON.parse(decompressedData);
      return json;
  }
  return str;
}

export function compressJson(str) {
  const jsonStr = JSON.stringify(str);
      const input = new TextEncoder().encode(jsonStr);
      const compressedData = pako.gzip(input);

      // Create a base64 string directly from the compressed data (Uint8Array)
      let base64String = '';
      const len = compressedData.length;
      for (let i = 0; i < len; i++) {
        base64String += String.fromCharCode(compressedData[i]);
      }
      base64String = btoa(base64String);
      return base64String;
}
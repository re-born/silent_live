
var isSmartphone = function(){
  return navigator.userAgent.search(/(iPhone|iPad|Android)/) !== -1;
}

Array.prototype.shift_n = function(n) {
  for (var i = 0; i < n; i++) { this.shift(n) }
}

/**
 *  hslからrgbに変換する関数
 *
 *  hue 色相。0〜360の数値を指定
 *  saturation 彩度 0〜100%の値を指定
 *  lightness 明度 0〜100%の値を指定
 */
 var hslToRgb = function(hue, saturation, lightness){
  var h = Number(hue),
  s = Number(saturation.replace('%', '')) / 100,
  l = Number(lightness.replace('%', '')) / 100,
  max = l <= 0.5 ? l * (1 + s) : l * (1 - s) + s,
  min = 2 * l - max,
  rgb = {};

  if (s == 0) {
    rgb.r = rgb.g = rgb.b = l;
  } else {
    var list = {};

    list['r'] = h >= 240 ? h - 240 : h + 120;
    list['g'] = h;
    list['b'] = h < 120 ? h + 240 : h - 120;

    for (var key in list) {
      var val = list[key],
      res;

      switch (true) {
        case val < 60:
        res = min + (max - min) * val / 60;
        break;

        case val < 180:
        res = max;
        break;

        case val < 240:
        res = min + (max - min) * (240 - val) / 60;
        break;

        case val < 360:
        res = min;
        break;
      }

      rgb[key] = res;
    }
  }
  return 'rgb(' + Math.round(rgb.r * 255) + ',' + Math.round(rgb.g * 255) + ',' + Math.round(rgb.b * 255) + ')';
}

/**
 * Функция расчета линейной регрессии
 * @param {number[]} x Значения по оси X
 * @param {number[]} y Значения по оси Y
 * @returns number
 */
 function linearRegression(x, y) {
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;
  
    for (var i = 0; i < y.length; i++) {
      sum_x += x[i];
      sum_y += y[i];
      sum_xy += x[i] * y[i];
      sum_xx += x[i] * x[i];
      sum_yy += y[i] * y[i];
    }
  
    lr["sl"] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr["off"] = (sum_y - lr.sl * sum_x) / n;
    lr["r2"] = Math.pow(
      (n * sum_xy - sum_x * sum_y) /
        Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)),
      2
    );
  
    return lr;
  }
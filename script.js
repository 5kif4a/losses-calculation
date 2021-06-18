// Константы
const GRAPH_ELEM_ID = "graph";

const waveLength1310nmValues = {
  deg45means: [0.0365, 0.0378, 0.0411, 0.0457, 0.0498, 0.0531, 0.0562, 0.0591],
  deg90means: [0.0371, 0.0393, 0.0428, 0.0472, 0.0493, 0.0526, 0.0563, 0.0599],
  deg135means: [0.0381, 0.0411, 0.0457, 0.0495, 0.0521, 0.0556, 0.0586, 0.0619],
};

const waveLength1550nmValues = {
  deg45means: [0.0483, 0.0522, 0.0527, 0.0552, 0.0597, 0.0611, 0.0646, 0.0685],
  deg90means: [0.0499, 0.0528, 0.0533, 0.0548, 0.0584, 0.0618, 0.0664, 0.0703],
  deg135means: [0.0515, 0.0536, 0.0561, 0.0576, 0.0603, 0.0657, 0.0674, 0.0726],
};

const waveLength1625nmValues = {
  deg45means: [0.0536, 0.0588, 0.0611, 0.0627, 0.0668, 0.0681, 0.0712, 0.0724],
  deg90means: [0.0564, 0.0599, 0.0611, 0.0641, 0.0665, 0.0698, 0.0741, 0.0771],
  deg135means: [0.0577, 0.0611, 0.0635, 0.0652, 0.0694, 0.0718, 0.0764, 0.0797],
};

const values = [
  waveLength1310nmValues,
  waveLength1550nmValues,
  waveLength1625nmValues,
];

// Элементы DOM

let waveLengthSelect = document.getElementById("wave-length");

let degree45input = document.getElementById("45degInput");
let degree90input = document.getElementById("90degInput");
let degree135input = document.getElementById("135degInput");

let degree45switch = document.getElementById("45degSwitch");
let degree90switch = document.getElementById("90degSwitch");
let degree135switch = document.getElementById("135degSwitch");

let linearApproximationInput = document.getElementById("linear-approximation");

let graphDiv = document.getElementById(GRAPH_ELEM_ID);

const inputs = [degree45input, degree90input, degree135input];
const inputIds = ["45degInput", "90degInput", "135degInput"];
const switches = [degree45switch, degree90switch, degree135switch];

// Обработчики

/**
 * @description Функция, очищающая график
 */
function clearGraph() {
  while (graphDiv.data.length > 0) {
    Plotly.deleteTraces(GRAPH_ELEM_ID, [0]);
  }
}

/**
 * @description Функция, сбрасывающая значения
 */
function resetValues() {
  waveLengthSelect.selectedIndex = "0";

  for (let input of inputs) {
    input.disabled = false;
    input.value = "0";
  }

  for (let _switch of switches) {
    _switch.checked = true;
  }

  Plotly.deleteTraces(GRAPH_ELEM_ID, 0);
}

/**
 * @description Функция, генерирующая случайное целое число
 * @param {number} max Максимальное значение случайного целого числа
 * @returns Случайное целое число от 0 до max
 */
function generateRandInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * @description Функция, устанавливающая случайные значения для расчетов
 */
function generateRandomValues() {
  waveLengthSelect.selectedIndex = generateRandInt(2).toString(); // 3 опции

  for (let input of inputs) {
    input.value = generateRandInt(7).toString();
  }

  for (let i = 0; i < 3; i++) {
    const randNumber = generateRandInt(100);

    switches[i].checked = !(randNumber > 50);
    inputs[i].disabled = randNumber > 50;
  }
}

/**
 * Обработчик переключения поля ввода
 * @param {string} inputId ID элемента <input>
 */
function handleToggleInput(inputId) {
  let input = document.getElementById(inputId);

  const state = document.getElementById(inputId).disabled;

  input.disabled = !state;
}

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
/**
 * @description Функция расчета и отрисовки графика
 */
function calculateAndDraw() {
  // очищаем консоль
  console.clear();

  let _trace = {
    x: [],
    y: [],
    name: "График потерь",
  };

  // получаем массив кол-ва углов
  const angleCounts = switches.map((_switch, index) => {
    return _switch.checked ? Number(inputs[index].value) : 0;
  });

  // получаем максимальное кол-во углов
  const maxAngleCount = Math.max(...angleCounts);

  console.log(`Максимальное количество углов: ${maxAngleCount}`);

  // текущая выбранная длина волны
  const currentWaveLength = waveLengthSelect.selectedIndex;

  console.log(
    `Выбранная длина волны: ${waveLengthSelect.options[currentWaveLength].text}`
  );

  // Значения по оси Х (значения кол-ва углов)
  _trace.x = [...Array(maxAngleCount + 1).keys()];

  console.log(`Значения по оси X: [${_trace.x.join(", ")}]`);

  // Значения по оси Y (средние значения)
  let _values = [];

  for (let i = 0; i <= maxAngleCount; i++) {
    let sum = 0;

    for (let j = 0; j < angleCounts.length; j++) {
      const _angleCount = angleCounts[j];

      const keys = Object.keys(values[currentWaveLength]);

      if (_angleCount >= maxAngleCount && switches[j].checked) {
        sum += values[currentWaveLength][keys[j]][i];
      }
    }

    _values.push(sum);
  }

  _trace.y = _values;

  console.log(`Значения по оси Y: [${_trace.y.join(", ")}]`);

  const lr = linearRegression(_trace.x, _trace.y);

  linearApproximationInput.value = (
    Math.round(lr.r2 * 10000) / 10000
  ).toString();

  console.log(`Линейная аппроксимация: ${JSON.stringify(lr, null, 2)}`);

  const fit_from = Math.min(..._trace.x);
  const fit_to = Math.max(..._trace.x);

  const fit = {
    x: [fit_from, fit_to],
    y: [fit_from * lr.sl + lr.off, fit_to * lr.sl + lr.off],
    mode: "lines",
    type: "scatter",
    name: "R2=".concat((Math.round(lr.r2 * 10000) / 10000).toString()),
  };

  clearGraph();

  Plotly.addTraces(GRAPH_ELEM_ID, _trace);
  Plotly.addTraces(GRAPH_ELEM_ID, fit);
}

// Установка обработчиков на switch-и

for (let [idx, _switch] of switches.entries()) {
  _switch.onclick = () => handleToggleInput(inputIds[idx]);
}

// График

const layout = {
  title: {
    text: "График потерь",
    font: {
      size: 24,
    },
    xref: "paper",
    x: 0.5,
  },
  xaxis: {
    title: {
      text: "Количество изгибов оптического волокна",
      font: {
        size: 18,
      },
    },
  },
  yaxis: {
    title: {
      text: "Дополнительные потери при изгибе, dB",
      font: {
        size: 14,
      },
    },
  },
};

const config = {
  responsive: true,
};

Plotly.newPlot(GRAPH_ELEM_ID, [], layout, config);
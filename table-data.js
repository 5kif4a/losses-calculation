// Константы
const TABLE_DATA_GRAPH_ELEM_ID = "table-data-graph";

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

let tableDataGraphDiv = document.getElementById(TABLE_DATA_GRAPH_ELEM_ID);

const inputs = [degree45input, degree90input, degree135input];
const inputIds = ["45degInput", "90degInput", "135degInput"];
const switches = [degree45switch, degree90switch, degree135switch];

// Обработчики

/**
 * @description Функция, удаляющая линии с графика
 */
function deleteGraphTraces() {
  if (tableDataGraphDiv.data.length > 0) {
    Plotly.newPlot(TABLE_DATA_GRAPH_ELEM_ID, [], tableDataGraphLayout, config);
  }
}

/**
 * @description Функция, сбрасывающая оси графика
 */
function resetGraphAxis() {
  const update = {
    "xaxis.range": [-1, 7],
    "yaxis.range": [-1, 4],
    "xaxis.autorange": true,
    "yaxis.autorange": true,
  };
  Plotly.relayout(TABLE_DATA_GRAPH_ELEM_ID, update);
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

  linearApproximationInput.value = "";

  deleteGraphTraces();
  resetGraphAxis();
}

/**
 * @description Функция валидации значении в полях
 */
function validateInputs() {
  return inputs.every((input) => {
    const number = Number(input.value);
    return number >= 0 && number <= 7;
  });
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
 * @description Функция расчета и отрисовки графика
 */
function calculateAndDraw() {
  // очищаем консоль
  console.clear();

  // Валидация
  const valuesIsValid = validateInputs();

  if (!valuesIsValid) {
    alert("Количество углов должно быть в диапазоне от 0 до 7");
    return;
  }

  let _trace = {
    x: [],
    y: [],
    name: "График потерь",
  };

  // текущая выбранная длина волны
  const currentWaveLength = waveLengthSelect.selectedIndex;

  console.log(
    `Выбранная длина волны: ${waveLengthSelect.options[currentWaveLength].text}`
  );

  // Значения по оси Y (средние значения)
  let _values = [];

  const keys = Object.keys(values[currentWaveLength]);

  for (const [idx, input] of inputs.entries()) {
    if (switches[idx].checked) {
      for (let i = 0; i <= Number(input.value); i++) {
        const value = values[currentWaveLength][keys[idx]][i];
        _values.push(value);
      }
    }
  }

  _trace.y = _values;

  console.log(`Значения по оси Y: [${_trace.y.join(", ")}]`);

  // Значения по оси Х (значения кол-ва углов)
  _trace.x = [...Array(_values.length).keys()];

  console.log(`Значения по оси X: [${_trace.x.join(", ")}]`);

  console.log(`Кол-во x: ${_trace.x.length} - Кол-во y: ${_trace.y.length}`);

  const lr = linearRegression(_trace.x, _trace.y);

  linearApproximationInput.value = (
    Math.round(lr.r2 * 10000) / 10000
  ).toString();

  console.log(`Линейная аппроксимация (R2): ${JSON.stringify(lr, null, 2)}`);

  const fit_from = Math.min(..._trace.x);
  const fit_to = Math.max(..._trace.x);

  const fit = {
    x: [fit_from, fit_to],
    y: [fit_from * lr.sl + lr.off, fit_to * lr.sl + lr.off],
    mode: "lines",
    type: "scatter",
    name: "R2=".concat((Math.round(lr.r2 * 10000) / 10000).toString()),
  };

  deleteGraphTraces();

  Plotly.addTraces(TABLE_DATA_GRAPH_ELEM_ID, _trace);
  Plotly.addTraces(TABLE_DATA_GRAPH_ELEM_ID, fit);
}

// Установка обработчиков на switch-и

for (let [idx, _switch] of switches.entries()) {
  _switch.onclick = () => handleToggleInput(inputIds[idx]);
}

// График

const tableDataGraphLayout = {
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

Plotly.newPlot(TABLE_DATA_GRAPH_ELEM_ID, [], tableDataGraphLayout, config);
// Константы
const MANUAL_GRAPH_ELEM_ID = "manual-graph";

// Элементы DOM

let coefAInput = document.getElementById("coefA");
let coefBInput = document.getElementById("coefB");
let valXInput = document.getElementById("valX");

let tableDataGraphDiv = document.getElementById(MANUAL_GRAPH_ELEM_ID);

// Обработчики

/**
 * @description Функция, удаляющая линии с графика
 */
function deleteGraphTraces(graphDiv, graphElemId, layout, config) {
  if (graphDiv.data.length > 0) {
    Plotly.newPlot(graphElemId, [], layout, config);
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
  };

  // Значения по оси Y (средние значения)
  let _values = [];

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

// Установка обработчиков

// График

const manualGraphLayout = {
  title: {
    text: "Линейная регрессия",
    font: {
      size: 24,
    },
    xref: "paper",
    x: 0.5,
  },
};

const config = {
  responsive: true,
};

Plotly.newPlot(MANUAL_GRAPH_ELEM_ID, [], manualGraphLayout, config);

// Константы
const MANUAL_GRAPH_ELEM_ID = "manual-graph";

// Элементы DOM

let coefAInput = document.getElementById("coefA");
let coefBInput = document.getElementById("coefB");
let valXInput = document.getElementById("valX");

let linearApproximationInputM = document.getElementById(
  "manual-linear-approximation"
);

let tableBody = document.getElementById("table-body");

let manualGraphDiv = document.getElementById(MANUAL_GRAPH_ELEM_ID);

let inputsM = [coefAInput, coefBInput, valXInput];

// Данные
let data = [];

// Обработчики

/**
 * @description Функция, удаляющая линии с графика
 */
function deleteManualGraphTraces() {
  if (manualGraphDiv.data.length > 0) {
    Plotly.newPlot(
      MANUAL_GRAPH_ELEM_ID,
      [],
      manualGraphLayout,
      manualGraphConfig
    );
  }
}

/**
 * @description Функция, сбрасывающая оси графика
 */
function resetManualGraphAxis() {
  const update = {
    "xaxis.range": [-5, 5],
    "yaxis.range": [-5, 5],
    "xaxis.autorange": true,
    "yaxis.autorange": true,
  };
  Plotly.relayout(MANUAL_GRAPH_ELEM_ID, update);
}

/**
 * @description Функция сброса значений в полях ввода
 */
function resetInputsM() {
  for (let input of inputsM) {
    input.disabled = false;
    input.value = "0";
  }
}

/**
 * @description Функция очистки таблицы
 */
function clearTableM() {
  tableBody.innerHTML = "";
}

/**
 * @description Функция, сбрасывающая значения
 */
function resetValuesM() {
  // очищаем консоль
  console.clear();
  // очищаем массив с данными
  data = [];
  // сбрасываем поля ввода
  resetInputsM();
  linearApproximationInputM.value = "";
  // очищаем таблицу
  clearTableM();
  // очищаем график
  deleteManualGraphTraces();
  // сбрасываем оси графика
  resetManualGraphAxis();
}

/**
 * @description Функция валидации значении в полях
 */
function validateInputsM() {
  const anyInputIsEmpty = inputsM.some((input) => input.value.length === 0);

  const coefAValueIsZero = Number(coefAInput.value) === 0;

  const valX = Number(valXInput.value);

  if (anyInputIsEmpty) {
    alert("Ни одно поле не должно быть пустым!");
    return false;
  }

  if (coefAValueIsZero) {
    alert("Коэффициент А не должен быть равен 0!");
    return false;
  }

  return true;
}

/**
 * @description Функция удаления строки из таблицы
 */
function deleteRow(event) {
  const btnId = event.target.id;
  const id = btnId.split("-")[3];

  data = data.filter((v) => v.id.toString() !== id);

  document.getElementById(`row-${id}`).remove();
}

/**
 * @description Функция добавления строки в таблицу
 */
function addRow(id, idx, a, b, x, y) {
  const row = document.createElement("tr");
  row.setAttribute("id", `row-${id}`);

  const _idx = document.createElement("td");
  _idx.textContent = idx;

  const _a = document.createElement("td");
  _a.textContent = a;

  const _b = document.createElement("td");
  _b.textContent = b;

  const _x = document.createElement("td");
  _x.textContent = x;

  const _y = document.createElement("td");
  _y.textContent = y;

  const controlCol = document.createElement("td");

  const btn = document.createElement("button");
  btn.setAttribute("class", "btn btn-danger");
  btn.setAttribute("id", `row-col-btn-${id}`);
  btn.innerHTML = "&times;";
  btn.onclick = (event) => deleteRow(event);

  controlCol.appendChild(btn);

  row.appendChild(_idx);
  row.appendChild(_a);
  row.appendChild(_b);
  row.appendChild(_x);
  row.appendChild(_y);
  row.appendChild(controlCol);

  tableBody.appendChild(row);
}

/**
 * @description Функция расчета Y
 */
function calculateY(x) {
  const _coefA = Number(coefAInput.value);
  const _coefB = Number(coefBInput.value);

  return _coefA * x + _coefB;
}

/**
 * @description Функция расчета и добавления значений в таблицу
 */
function addValues() {
  const isValid = validateInputsM();

  if (!isValid) {
    return;
  }

  const a = coefAInput.value;
  const b = coefBInput.value;
  const x = Number(valXInput.value);
  const y = calculateY(x);
  const id = new Date().getTime();

  data.push({ id, x, y });

  const idx = data.length;

  addRow(id, idx, a, b, x, y);
}

/**
 * @description Функция отрисовки графика
 */
function drawManualGraph() {
  if (data.length === 0) {
    alert("Нет данных для построения графика!");
    return;
  }

  // очищаем консоль
  console.clear();

  let _trace = {
    x: data.map((v) => v.x),
    y: data.map((v) => v.y),
    name: "График ручных данных",
    mode: "lines+markers+text",
    text: data.map((v) => v.y.toString()),
    textposition: "top",
    textfont: {
      size: 14,
      color: "#000",
    },
  };

  console.log(`Значения по оси X: [${_trace.x.join(", ")}]`);
  console.log(`Значения по оси Y: [${_trace.y.join(", ")}]`);

  console.log(`Кол-во x: ${_trace.x.length} - Кол-во y: ${_trace.y.length}`);

  const lr = linearRegression(_trace.x, _trace.y);

  linearApproximationInputM.value = (
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

  deleteManualGraphTraces();

  Plotly.addTraces(MANUAL_GRAPH_ELEM_ID, _trace);
  Plotly.addTraces(MANUAL_GRAPH_ELEM_ID, fit);
}

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

const manualGraphConfig = {
  responsive: true,
};

Plotly.newPlot(MANUAL_GRAPH_ELEM_ID, [], manualGraphLayout, manualGraphConfig);

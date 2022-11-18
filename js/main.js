// View Swap
var $mainBody = document.querySelector('main');
var $viewNodes = $mainBody.querySelectorAll('[data-view]:not(button)');
var $homeNav = document.querySelector('#home-Nav');
var $calNav = document.querySelector('#cal-Nav');
var $calButton = document.querySelector('#calculate-butt');
var $calMenu = document.querySelector('#cal-menu');
var $hisNav = document.querySelector('#his-Nav');
var $hisMenu = document.querySelector('#his-menu');

$homeNav.addEventListener('click', viewSwap);
$calNav.addEventListener('click', viewSwap);
$calButton.addEventListener('click', viewSwap);
$calMenu.addEventListener('click', viewSwap);
$hisNav.addEventListener('click', viewSwap);
$hisMenu.addEventListener('click', viewSwap);

function viewSwap(event) {
  if (typeof event === 'object') {
    for (var i = 0; i < $viewNodes.length; i++) {
      if (event.target.getAttribute('data-view') === $viewNodes[i].getAttribute('data-view')) {
        $viewNodes[i].setAttribute('class', '');
      } else {
        $viewNodes[i].setAttribute('class', 'dis-none');
      }
    }
    if (event.target.getAttribute('data-view') !== 'calculate') {
      data.editing = null;
    }
  } else {
    for (var j = 0; j < $viewNodes.length; j++) {
      if (event === $viewNodes[j].getAttribute('data-view')) {
        $viewNodes[j].setAttribute('class', '');
      } else {
        $viewNodes[j].setAttribute('class', 'dis-none');
      }
    }
    if (event !== 'calculate') {
      data.editing = null;
    }
  }
  $menuWindow.setAttribute('class', 'dis-none');
  updateHistoryLineGraph();
  updateHistoryTable();
}

// form control
var $formElements = document.querySelector('form');
$formElements.addEventListener('submit', formHandle);
var defaultRangeValue = ['50', '50', '6', '150'];

function formHandle(event) {
  event.preventDefault();
  var formAnswers = {};
  formAnswers.vehicle = $formElements.elements.vehicleType.value;
  formAnswers.distance = Number($formElements.elements.drive.value);
  formAnswers.food = Number($formElements.elements.food.value);
  formAnswers.entertain = Number($formElements.elements.entertain.value);
  formAnswers.shopping = Number($formElements.elements.shopping.value);
  for (var i = 0; i < defaultRangeValue.length; i++) {
    $rangeTextNodes[i].textContent = defaultRangeValue[i];
  }
  var parsedAnswers = parseAnswer(formAnswers);
  getResult(parsedAnswers, formAnswers);
  $formElements.reset();
}

// Nav bar window interactive
var $menuIcon = document.querySelector('#menu-icon');
var $menuWindow = document.querySelector('#menu-window');
$menuIcon.addEventListener('mouseenter', menuHandle);

function menuHandle() {
  $menuWindow.setAttribute('class', '');
  setTimeout(() => {
    $menuWindow.setAttribute('class', 'dis-none');
  }, 3000);
}

// Form range interactive
var $rangeTextNodes = document.querySelectorAll('[data-range]:not(input)');
var $rangeNodes = document.querySelector('#calculatePage');
$rangeNodes.addEventListener('change', rangeHandle);

function rangeHandle(event) {
  if (!event.target.hasAttribute('data-range')) {
    return;
  }
  for (var i = 0; i < $rangeTextNodes.length; i++) {
    if (event.target.getAttribute('data-range') === $rangeTextNodes[i].getAttribute('data-range')) {
      $rangeTextNodes[i].textContent = event.target.value;
      return;
    }
  }
}

// Http Request

function getResult(answers, formAns) {
  var xhr = new XMLHttpRequest();
  var url = 'https://beta3.api.climatiq.io/batch';
  var bearer = 'Bearer 9ZK7P5YBPVMBJ1HVF3K6G99FHDH4';
  var formData = answers;
  xhr.open('POST', url);
  xhr.setRequestHeader('Authorization', bearer);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    var newFootprint = xhr.response;
    var parsedFootprint = parseAPIData(newFootprint);
    parsedFootprint.formAnswers = formAns;
    if (data.editing) {
      for (var i = 0; i < data.footprints.length; i++) {
        if (data.editing.entryId === data.footprints[i].entryId) {
          data.footprints[i] = parsedFootprint;
          break;
        }
      }
    } else {
      parsedFootprint.entryId = data.entryId;
      data.entryId++;
      data.footprints.push(parsedFootprint);
    }
    updateResultPage(parsedFootprint);
    viewSwap('result');
  });
  xhr.send(formData);
}

function parseAnswer(answers) {
  var vehicles = {
    sedan: 'passenger_vehicle-vehicle_type_car-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
    truck: 'commercial_vehicle-vehicle_type_truck_medium_or_heavy-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
    suv: 'commercial_vehicle-vehicle_type_truck_light-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
    none: 'passenger_vehicle-vehicle_type_bus-fuel_source_na-distance_na-engine_size_na',
    motorcycle: 'passenger_vehicle-vehicle_type_motorcycle-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na'
  };
  var climatiqObj = [
    {
      emission_factor: {
        activity_id: vehicles[answers.vehicle]
      },
      parameters: {
        distance: answers.distance,
        distance_unit: 'mi'
      }
    },
    {
      emission_factor: {
        activity_id: 'consumer_goods-type_snack_foods'
      },
      parameters: {
        money: answers.food,
        money_unit: 'usd'
      }
    },
    {
      emission_factor: {
        activity_id: 'electricity-energy_source_grid_mix'
      },
      parameters: {
        energy: answers.entertain * 0.5,
        energy_unit: 'kWh'
      }
    },
    {
      emission_factor: {
        activity_id: 'consumer_goods-type_clothing_clothing_accessories_stores'
      },
      parameters: {
        money: answers.shopping,
        money_unit: 'usd'
      }
    }
  ];
  return JSON.stringify(climatiqObj);
}

// Parsing data
// Access CO2e -> Object[index].constituent_gases.co2e_total
// Access CO2  -> Object[index].constituent_gases.co2
// Access CH4  -> Object[index].constituent_gases.ch4
// Access N2O  -> Object[index].constituent_gases.n2o

function parseAPIData(dataAPI) {
  var newFootprintObject = {
    date: null,
    entryId: null,
    data: null,
    total: {
      co2e: 0,
      co2: 0,
      ch4: 0,
      n2o: 0
    }
  };
  var date = new Date();
  newFootprintObject.date = String(date.getMonth()) + '/' + String(date.getDate()) + '/' + String(date.getFullYear());
  newFootprintObject.data = dataAPI;
  for (var i = 0; i < dataAPI.results.length; i++) {
    if (dataAPI.results[i].constituent_gases.co2e_total) {
      newFootprintObject.total.co2e += dataAPI.results[i].constituent_gases.co2e_total;
    }
    if (dataAPI.results[i].constituent_gases.co2) {
      newFootprintObject.total.co2 += dataAPI.results[i].constituent_gases.co2;
    }
    if (dataAPI.results[i].constituent_gases.ch4) {
      newFootprintObject.total.ch4 += dataAPI.results[i].constituent_gases.ch4;
    }
    if (dataAPI.results[i].constituent_gases.n2o) {
      newFootprintObject.total.n2o += dataAPI.results[i].constituent_gases.n2o;
    }
  }
  return newFootprintObject;
}

function updateResultPage(obj) {
  var $resultGraphCO2e = document.querySelector('#resultGraphCO2e');
  var $resultGraphCO2 = document.querySelector('#resultGraphCO2');
  var $resultGraphCH4 = document.querySelector('#resultGraphCH4');
  var $resultGraphN2O = document.querySelector('#resultGraphN2O');
  var $resultTextCO2e = document.querySelector('#CO2eResultText');
  var $resultTextCO2 = document.querySelector('#CO2ResultText');
  var $resultTextCH4 = document.querySelector('#CH4ResultText');
  var $resultTextN2O = document.querySelector('#N2OResultText');
  var $resultDate = document.querySelector('#resultDate');

  $resultGraphCH4.textContent = Number.parseFloat(obj.total.ch4.toPrecision(3));
  $resultGraphCO2.textContent = Number.parseFloat(obj.total.co2.toPrecision(3));
  $resultGraphCO2e.textContent = Number.parseFloat(obj.total.co2e.toPrecision(3));
  $resultGraphN2O.textContent = Number.parseFloat(obj.total.n2o.toPrecision(3));
  $resultTextCH4.textContent = Number.parseFloat(obj.total.ch4.toPrecision(3));
  $resultTextCO2.textContent = Number.parseFloat(obj.total.co2.toPrecision(3));
  $resultTextCO2e.textContent = Number.parseFloat(obj.total.co2e.toPrecision(3));
  $resultTextN2O.textContent = Number.parseFloat(obj.total.n2o.toPrecision(3));
  $resultDate.textContent = obj.date;
}

function updateHistoryLineGraph() {
  var $lineGraph = document.querySelector('#my-chart-line > tbody');
  $lineGraph.replaceChildren();
  var startValue = [0.0, 0.0, 0.0, 0.0];
  for (var i = 0; i < data.footprints.length; i++) {
    var newTR = renderSingleTRLineGraph(data.footprints[i], startValue);
    $lineGraph.appendChild(newTR[0]);
    startValue[0] = newTR[1][0];
    startValue[1] = newTR[1][1];
    startValue[2] = newTR[1][2];
    startValue[3] = newTR[1][3];
  }
}

function renderSingleTRLineGraph(obj, startValues) {
  var returnValue = [];
  // Max condition:
  var CO2Max = 235;
  var CO2eMax = 97;
  var CH4Max = 0.45;
  var N2OMax = 0.0037;
  var endValues = [
    (Number.parseFloat(obj.total.co2) / CO2Max).toPrecision(2),
    (Number.parseFloat(obj.total.co2e) / CO2eMax).toPrecision(2),
    (Number.parseFloat(obj.total.ch4) / CH4Max).toPrecision(2),
    (Number.parseFloat(obj.total.n2o) / N2OMax).toPrecision(2)
  ];
  // style="--start: 0.0; --size: 0.4"
  var $tdCO2 = document.createElement('td');
  $tdCO2.setAttribute('style', '--start: ' + String(startValues[0]) + '; --size: ' + String(endValues[0]));
  var $spanCO2 = document.createElement('span');
  $spanCO2.className = 'data';
  $tdCO2.appendChild($spanCO2);
  var $tdCO2e = document.createElement('td');
  $tdCO2e.setAttribute('style', '--start: ' + String(startValues[1]) + '; --size: ' + String(endValues[1]));
  var $spanCO2e = document.createElement('span');
  $spanCO2e.className = 'data';
  $tdCO2e.appendChild($spanCO2e);
  var $tdCH4 = document.createElement('td');
  $tdCH4.setAttribute('style', '--start: ' + String(startValues[2]) + '; --size: ' + String(endValues[2]));
  var $spanCH4 = document.createElement('span');
  $spanCH4.className = 'data';
  $tdCH4.appendChild($spanCH4);
  var $tdN2O = document.createElement('td');
  $tdN2O.setAttribute('style', '--start: ' + String(startValues[3]) + '; --size: ' + String(endValues[3]));
  var $spanN2O = document.createElement('span');
  $spanN2O.className = 'data';
  $tdN2O.appendChild($spanN2O);
  var $trLine = document.createElement('tr');
  $spanCO2.textContent = Number.parseFloat(obj.total.co2.toPrecision(2));
  $spanCO2e.textContent = Number.parseFloat(obj.total.co2e.toPrecision(2));
  $spanCH4.textContent = Number.parseFloat(obj.total.ch4.toPrecision(2));
  $spanN2O.textContent = Number.parseFloat(obj.total.n2o.toPrecision(2));
  $trLine.appendChild($tdCO2);
  $trLine.appendChild($tdCO2e);
  $trLine.appendChild($tdCH4);
  $trLine.appendChild($tdN2O);
  returnValue.push($trLine, endValues);
  return returnValue;
}

function updateHistoryTable() {
  var $hisTableBody = document.querySelector('#history-table-body');
  $hisTableBody.replaceChildren();
  for (var i = 0; i < data.footprints.length; i++) {
    var newTR = renderSingleTRHisTable(data.footprints[i]);
    $hisTableBody.appendChild(newTR);
  }
}

function renderSingleTRHisTable(obj) {
  var $tdCO2 = document.createElement('td');
  var $tdCO2e = document.createElement('td');
  var $tdCH4 = document.createElement('td');
  var $tdN2O = document.createElement('td');
  var $date = document.createElement('td');
  var $editTd = document.createElement('td');
  var $editButton = document.createElement('button');
  $editButton.textContent = 'edit';
  $editButton.setAttribute('id', obj.entryId);
  $date.textContent = obj.date;
  $tdCO2.textContent = Number.parseFloat(obj.total.co2.toPrecision(2));
  $tdCO2e.textContent = Number.parseFloat(obj.total.co2e.toPrecision(2));
  $tdCH4.textContent = Number.parseFloat(obj.total.ch4.toPrecision(2));
  $tdN2O.textContent = Number.parseFloat(obj.total.n2o.toPrecision(2));
  var $trLine = document.createElement('tr');
  $editTd.appendChild($editButton);
  $trLine.appendChild($date);
  $trLine.appendChild($tdCO2);
  $trLine.appendChild($tdCO2e);
  $trLine.appendChild($tdCH4);
  $trLine.appendChild($tdN2O);
  $trLine.appendChild($editTd);
  return $trLine;
}

var $lineGraphDOM = document.querySelector('#my-chart-line');
var $lineLegendUL = document.querySelector('#line-chart-legend');
$lineLegendUL.addEventListener('click', focusLineGraph);
var idMatchBoolean = {
  CO2Legend: false,
  CO2eLegend: false,
  CH4Legend: false,
  N2OLegend: false
};
var lineColors = {
  CO2Legend: 'rgba(230, 30, 30, 0.525)',
  CO2eLegend: 'rgba(180, 230, 30, 0.656)',
  CH4Legend: 'rgba(30, 230, 223, 0.49)',
  N2OLegend: 'rgba(120, 30, 230, 0.542)'
};

function focusLineGraph(event) {
  if (event.target.nodeName !== 'LI') {
    return;
  }
  if (idMatchBoolean[event.target.getAttribute('id')]) {
    updateHistoryLineGraph();
    $lineGraphDOM.style.setProperty('--color-1', lineColors.CO2Legend);
    idMatchBoolean[event.target.getAttribute('id')] = false;
    $lineGraphDOM.classList.remove('show-data');
    $lineGraphDOM.classList.add('hide-data');
    return;
  }
  updateHistoryLineGraph();
  var idMatchIndex = {
    CO2Legend: 0,
    CO2eLegend: 1,
    CH4Legend: 2,
    N2OLegend: 3
  };
  var $lineGraphTbody = document.querySelector('#my-chart-line > tbody');
  var $allTrNodes = $lineGraphTbody.querySelectorAll('tr');
  for (var i = 0; i < $allTrNodes.length; i++) {
    for (var j = 3; j >= 0; j--) {
      if (!(j === idMatchIndex[event.target.getAttribute('id')])) {
        $allTrNodes[i].childNodes[j].remove();
      }
    }
  }
  idMatchBoolean = {
    CO2Legend: false,
    CO2eLegend: false,
    CH4Legend: false,
    N2OLegend: false
  };
  idMatchBoolean[event.target.getAttribute('id')] = true;
  $lineGraphDOM.style.setProperty('--color-1', lineColors[event.target.getAttribute('id')]);
  $lineGraphDOM.classList.remove('hide-data');
  $lineGraphDOM.classList.add('show-data');
}

var $hisTable = document.querySelector('#history-table');
$hisTable.addEventListener('click', historyHandle);

function historyHandle(event) {
  if (event.target.tagName !== 'BUTTON') {
    return;
  }
  for (var i = 0; i < data.footprints.length; i++) {
    if (parseInt(event.target.getAttribute('id')) === data.footprints[i].entryId) {
      data.editing = data.footprints[i];
      break;
    }
  }
  $formElements.elements.vehicleType.value = data.editing.formAnswers.vehicle;
  $formElements.elements.drive.value = data.editing.formAnswers.distance;
  $formElements.elements.food.value = data.editing.formAnswers.food;
  $formElements.elements.entertain.value = data.editing.formAnswers.entertain;
  $formElements.elements.shopping.value = data.editing.formAnswers.shopping;
  $rangeTextNodes[0].textContent = data.editing.formAnswers.distance;
  $rangeTextNodes[1].textContent = data.editing.formAnswers.food;
  $rangeTextNodes[2].textContent = data.editing.formAnswers.entertain;
  $rangeTextNodes[3].textContent = data.editing.formAnswers.shopping;
  viewSwap('calculate');
}

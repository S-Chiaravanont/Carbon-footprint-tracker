// View Swap
var $mainBody = document.querySelector('main');
var $viewNodes = $mainBody.querySelectorAll('[data-view]:not(button)');
var $homeNav = document.querySelector('#home-Nav');
var $calNav = document.querySelector('#cal-Nav');
var $calButton = document.querySelector('#calculate-butt');
var $calMenu = document.querySelector('#cal-menu');

$homeNav.addEventListener('click', viewSwap);
$calNav.addEventListener('click', viewSwap);
$calButton.addEventListener('click', viewSwap);
$calMenu.addEventListener('click', viewSwap);

function viewSwap(event) {
  if (typeof event === 'object') {
    for (var i = 0; i < $viewNodes.length; i++) {
      if (event.target.getAttribute('data-view') === $viewNodes[i].getAttribute('data-view')) {
        $viewNodes[i].setAttribute('class', '');
      } else {
        $viewNodes[i].setAttribute('class', 'dis-none');
      }
    }
  } else {
    for (var j = 0; j < $viewNodes.length; j++) {
      if (event === $viewNodes[j].getAttribute('data-view')) {
        $viewNodes[j].setAttribute('class', '');
      } else {
        $viewNodes[j].setAttribute('class', 'dis-none');
      }
    }
  }
  $menuWindow.setAttribute('class', 'dis-none');
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
  $formElements.reset();
  for (var i = 0; i < defaultRangeValue.length; i++) {
    $rangeTextNodes[i].textContent = defaultRangeValue[i];
  }
  var parsedAnswers = parseAnswer(formAnswers);
  getResult(parsedAnswers);
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

function getResult(answers) {
  var xhr = new XMLHttpRequest();
  var url = 'https://beta3.api.climatiq.io/batch';
  var bearer = 'Bearer 9ZK7P5YBPVMBJ1HVF3K6G99FHDH4';
  var formData = answers;
  xhr.open('POST', url);
  xhr.setRequestHeader('Authorization', bearer);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    data.push(xhr.response);
    viewSwap('result');
  });
  xhr.send(formData);
}

function parseAnswer(answers) {
  var vehicles = {
    sedan: 'passenger_vehicle-vehicle_type_car-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
    truck: 'passenger_vehicle-vehicle_type_pickup_trucks_vans_suvs-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
    suv: 'passenger_vehicle-vehicle_type_pickup_trucks_vans_suvs-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
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

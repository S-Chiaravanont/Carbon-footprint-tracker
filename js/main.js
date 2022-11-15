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
  for (var i = 0; i < $viewNodes.length; i++) {
    if (event.target.getAttribute('data-view') === $viewNodes[i].getAttribute('data-view')) {
      $viewNodes[i].setAttribute('class', '');
    } else {
      $viewNodes[i].setAttribute('class', 'dis-none');
    }
  }
  $menuWindow.setAttribute('class', 'dis-none');
}

// form control
var formAnswers = {};
var $formElements = document.querySelector('form');
$formElements.addEventListener('submit', formHandle);
var defaultRangeValue = ['50', '50', '6', '150'];

function formHandle(event) {
  event.preventDefault();
  formAnswers.vehicle = $formElements.elements.vehicleType.value;
  formAnswers.distance = Number($formElements.elements.drive.value);
  formAnswers.food = Number($formElements.elements.food.value);
  formAnswers.entertain = Number($formElements.elements.entertain.value);
  formAnswers.shopping = Number($formElements.elements.shopping.value);
  $formElements.reset();
  for (var i = 0; i < defaultRangeValue.length; i++) {
    $rangeTextNodes[i].textContent = defaultRangeValue[i];
  }
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

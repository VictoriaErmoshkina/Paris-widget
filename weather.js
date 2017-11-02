var params = document.querySelector('.params');
var widget = document.querySelector('.widget');
var btn = params.querySelector('button');
var APIKey = '13994b00561a33c084b28f8cd7e87b98';
var daysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var numberOfTempsPerDay = 8;
var XHR = ('onload' in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
var xhr = new XHR();
var interval = 600000;
var response;
var city;
var numberOfDays;
var url;
var days = [];
var temperature = [];
var week = widget.querySelector('.week');

btn.addEventListener('click', makeForecast);

function makeForecast(){
  getParams(city, numberOfDays, url);
  updateForecast();
  setInterval(function () {
    updateForecast();
  }, interval);
}

function getParams(city, numberOfDays, url){
  this.city = params.querySelector('input[name=\'city\']').value.replace(/\s+/g, '-').toLowerCase();
  this.numberOfDays = params.querySelector('input[name=\'number-of-days\']:checked').value;
  this.url = 'http://api.openweathermap.org/data/2.5/forecast?appid=' + APIKey + '&q=' + this.city +'&units=metric';
}

function updateForecast(){
  sendRequest(url, response);
  setTimeout(function(){
    setTemperature(temperature, response);
    setDays(days, response);
    renderWeekItems(week, temperature, days, daysNames);
    renderWidgetInformation(widget, response, temperature);
  }, 500);
}

function sendRequest(url){
  xhr.open('GET', this.url, true);
  xhr.onload = function() {
    response = JSON.parse(xhr.responseText);
  }
  xhr.onerror = function() {
    alert( 'Ошибка ' + xhr.status );
  }
  xhr.send();
}

function setTemperature(temperature, response){
  for (var i=0; i < numberOfDays; i++){
    this.temperature[i] = this.response.list[i*numberOfTempsPerDay].main.temp;
  }
}

function setDays(days, response){ //0 is Sunday
  var date = new Date(this.response.list[0].dt_txt);
  var day = date.getDay();
  this.days[0] = day++;
  for (var i = 1; i < 5; i++)
    this.days[i] = day++ % 7;
}


function renderWeekItems(week, temperature, days, daysNames){
  var weekOl = this.week.querySelector('ol');
  var weekItems = weekOl.querySelectorAll('li');
  for (var i = 0; i < 4; i++){
    weekItems[i].childNodes[0].data = this.daysNames[this.days[i]];
    weekItems[i].childNodes[2].data = Math.ceil(this.temperature[i]) + String.fromCharCode(176);
  }
}

function renderWidgetInformation(widget, response, temperature){
  var todayElem = this.widget.querySelector(".today");
  var dateInfoElem = todayElem.querySelector(".date");
  var dayElem = dateInfoElem.querySelector(".day-of-week");
  var dateElem = dateInfoElem.querySelector(".month-day");
  var todayInfoElem = todayElem.querySelector(".today-info");
  var degreesElem = todayInfoElem.querySelector(".degrees");
  var cityElem = todayElem.querySelector(".city");
  var windSpeedElem = todayElem.querySelector(".wind-speed-number");
  var date = new Date(this.response.list[0].dt_txt);
  dayElem.childNodes[0].data = daysNames[date.getDay()];
  dateElem.childNodes[0].data = monthNames[date.getMonth()] +', '+ date.getDate() + makeEnding(date.getDate());
  degreesElem.childNodes[0].data = Math.ceil(this.temperature[0]) + String.fromCharCode(176);
  cityElem.childNodes[0].data = this.response.city.name;
  windSpeedElem.childNodes[0].data = Math.ceil(this.response.list[0].wind.speed);
}

function makeEnding(day){
  if (day % 10 == 1)
    return 'st';
  if (day % 10 == 2)
    return 'nd';
  if (day % 10 == 3)
    return 'rd';
  return 'th';
}

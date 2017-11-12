var WEATHER_MODULE = (function () {
    var form;
    var widget;
    var weekElem;
    var weekOlElem;
    var valuesForHTMLElements;
    var params;
    const APIKey = '13994b00561a33c084b28f8cd7e87b98';
    const interval = 600000;
    const numberOfTempsPerDay = 8;
    const daysNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'];
    const iconType = {
        rainy: "images/Rainy.png",
        cloudy: "images/Cloudy.png",
        sunny: "images/Sunny.png",
        overcast: "images/Overcast.png"
    };

    var init = function (widgetElem, formElem) {
        widget = widgetElem;
        form = formElem;
        var btn = form.querySelector('button');
        weekElem = widget.querySelector('.week');
        var btnNext = weekElem.querySelector(".button-next");
        var btnBack = weekElem.querySelector(".button-back");
        weekOlElem = weekElem.querySelector("ol");
        btnNext.onclick = function () {
            clickNext(weekOlElem);
        };
        btnBack.onclick = function () {
            clickBack(weekOlElem);
        }
        btn.onclick = function () {
            params = getParams(form);
            makeForecast();
        }
    };

    var getParams = function (formElem) {
        var city = formElem.querySelector('input[name=\'city\']').value.replace(/\s+/g, '-').toLowerCase();
        var numberOfDays = formElem.querySelector('input[name=\'number-of-days\']:checked').value;
        var url = 'http://api.openweathermap.org/data/2.5/forecast?appid=' + APIKey + '&q=' + city + '&units=metric';
        return {
            city: city,
            numberOfDays: numberOfDays,
            url: url
        }
    };

    var makeForecast = function () {
        getForecast();
        setInterval(function () {
            getForecast();
        }, interval);
    };

    var getForecast = function () {
        var XHR = ('onload' in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
        var xhr = new XHR();
        xhr.open('GET', params.url, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                console.log("Can't get weather in " + params.city);
            } else {
                let response = JSON.parse(xhr.responseText);
                valuesForHTMLElements = setValues(response);
                render();

            }
        };
    }

    var setValues = function (response) {
        var date = new Date(response.list[0].dt_txt);
        var cityName = response.city.name;
        var windSpeed = Math.ceil(response.list[0].wind.speed);
        var icons = setIcons(response);
        var days = setDays(date);
        var degrees = setTemperature(response);
        return {
            date: date,
            cityName: cityName,
            windSpeed: windSpeed,
            icons: icons,
            days: days,
            degreesList: degrees
        }
    };

    var render = function () {
        renderWeekItems(weekOlElem, valuesForHTMLElements, daysNames);
        renderWidgetInformation(widget, valuesForHTMLElements);
    };

    var setDays = function (date) { //0 is Sunday
        let days = [];
        var day = date.getDay();
        for (var i = 0; i < 5; i++)
            days[i] = day++ % 7;
        return days;
    };

    var setIcons = function (response) {
        let icons = [];
        for (var i = 0; i < params.numberOfDays; i++) {
            var icon = response.list[i * numberOfTempsPerDay].weather[0].icon;
            icon = icon.slice(0, icon.length);
            icons[i] = parseInt(icon);
        }
        return icons;
    };

    var setTemperature = function (response) {
        var degrees = [];
        for (var i = 0; i < params.numberOfDays; i++) {
            degrees[i] = Math.ceil(response.list[i * numberOfTempsPerDay].main.temp);
        }
        return degrees;
    };

    var renderWeekItems = function (weekOl, values, daysNames) {
        removeAllChildren(weekOl);
        var day;
        var icon;
        var degrees;
        for (var i = 0; i < 5; i++) {
            day = daysNames[values.days[i]];
            icon = choseIconType(values.icons[i]);
            degrees = values.degreesList[i] + String.fromCharCode(176);
            weekOl.appendChild(createWeekItem(day, icon, degrees));
        }
        var lastItem = weekOl.lastChild;
        lastItem.className = "hidden";
        lastItem.previousSibling.className = "last-day";
        weekOl.firstChild.className = "first-day";
    };

    var removeAllChildren = function (parentElem) {
        while (parentElem.firstChild) {
            parentElem.removeChild(parentElem.firstChild);
        }
    };

    var choseIconType = function (id) {
        if (id == 1) {
            return iconType.sunny;
        } else if (id == 9 || id == 10 || id == 11) {
            return iconType.rainy;
        } else if (id == 3 || id == 4) {
            return iconType.cloudy;
        } else if (id == 2) {
            return iconType.overcast;
        } else if (id == 50) {
            return "mist";
        } else if (id == 13) {
            return "undefined weather icon";
        }
    };


    var createWeekItem = function (day, type, degrees) {
        var item = document.createElement("li");
        item.appendChild(document.createTextNode(day));
        item.appendChild(createIconElem(type));
        item.appendChild(document.createTextNode(degrees));
        return item;
    };

    var createIconElem = function (type) {
        var img = document.createElement("img");
        switch (type) {
            case iconType.rainy:
                img.src = type;
                img.alt = "rainy";
                img.className = "rainy";
                break;
            case iconType.cloudy:
                img.src = type;
                img.alt = "cloudy";
                img.className = "cloudy";
                break;
            case iconType.sunny:
                img.src = type;
                img.alt = "sunny";
                img.className = "sunny";
                break;
            case iconType.overcast:
                img.src = type;
                img.alt = "overcast";
                img.className = "overcast";
                break;
            default:
                img.alt = type;
                break;
        }
        return img;
    };

    var renderWidgetInformation = function (widget, values) {
        var todayElem = widget.querySelector(".today");
        var dateInfoElem = todayElem.querySelector(".date");
        var dayElem = dateInfoElem.querySelector(".day-of-week");
        var dateElem = dateInfoElem.querySelector(".month-day");
        var todayInfoElem = todayElem.querySelector(".today-info");
        var degreesElem = todayInfoElem.querySelector(".degrees");
        var cityElem = todayElem.querySelector(".city");
        var windSpeedElem = todayElem.querySelector(".wind-speed-number");
        dayElem.childNodes[0].data = daysNames[values.date.getDay()];
        dateElem.childNodes[0].data = monthNames[values.date.getMonth()] + ', ' + values.date.getDate()
            + makeEnding(values.date.getDate());
        degreesElem.childNodes[0].data = values.degreesList[0] + String.fromCharCode(176);
        cityElem.childNodes[0].data = values.cityName;
        windSpeedElem.childNodes[0].data = values.windSpeed;
    };

    var makeEnding = function (day) {
        if (day % 10 == 1)
            return 'st';
        if (day % 10 == 2)
            return 'nd';
        if (day % 10 == 3)
            return 'rd';
        return 'th';
    };

    var clickNext = function (weekOl) {
        var weekItems = weekOl.querySelectorAll("li");
        var last = weekItems.length - 1;
        if (weekItems[last].className != "last-day") {
            weekItems[0].className = "hidden";
            weekItems[1].className = "first-day";
            weekItems[last - 1].className = "";
            weekItems[last].className = "last-day";
        }
    };

    var clickBack = function (weekOl) {
        var weekItems = weekOl.querySelectorAll("li");
        var last = weekItems.length - 1;
        if (weekItems[0].className != "first-day") {
            weekItems[0].className = "first-day";
            weekItems[1].className = "";
            weekItems[last - 1].className = "last-day";
            weekItems[last].className = "hidden";
        }
    };

    return {
        init: init
    };
}());

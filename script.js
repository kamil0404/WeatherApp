const apiKey = '1b3ad55cfcf546f895a101619231402';

const inputSearch = document.querySelector('#input_search');  
const weatherInfo = document.querySelector('.weather-info');
const choiceTownForm = document.querySelector('.choice_town_form');
const cityExample = document.querySelector('.choice_example > strong');
const bookmarkBtn = document.querySelector('.bookmarkBtn input');
const choiceIzhevsk = document.querySelector('.choice_izhevsk');
const fieldCards = document.querySelector(".field_cards"); 
const preloader = document.querySelector("#preloader");
let cities = []
let city


if(localStorage.getItem('citiesWeather')) {
    cities = JSON.parse(localStorage.getItem('citiesWeather'))
}
cities.forEach((citi) => {
    const card = `<div class="card">
                        <div class="card_city">${citi.cityName}</div>
                        <div class="card_temperature">${Math.round(citi.cityTemperature)}<sup>°</sup></div>
                        <div class="card_icon"><img src="${citi.cityIcon}" alt="weather-icon"></div>
                  </div>`           
                  fieldCards.insertAdjacentHTML('beforeend', card);

    if(choiceIzhevsk) choiceIzhevsk.remove()
});


document.body.addEventListener('click', (e) =>{
    if(e.target === cityExample) {
        return fetchData('Ижевск')
    }
})

function showPrelaoder() {
    preloader.classList.add('show')
}


function hidePrelaoder() {
    preloader.classList.remove('show')
}


function showWeatherData() {
    choiceTownForm.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            e.preventDefault()
            city = inputSearch.value.trim()
            document.querySelector('#app').addEventListener('load', () => {
                preloader.style.display = 'block'
            })
            fetchData(city)
        }
    })
}
showWeatherData()



const fetchData = async(city) => {
    try {
        showPrelaoder()
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no&lang=ru`;
        const urlSunset = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${city}&aqi=no&lang=ru`
        const result = await fetch(url); 
        const data = await result.json(); 
    
        const resultSunSet = await fetch(urlSunset);
        const sunSetData = await resultSunSet.json();
        const sunSet = sunSetData.astronomy.astro.sunset;
        const convertedTime = convertTime12to24(sunSet);
    
        const {location:{name}, current:{condition:{text, icon}, temp_c:temperature, pressure_mb:pressure}} = data;
        hidePrelaoder()
        createCard(name, text, icon,temperature, pressure, convertedTime);
        weatherInfo.classList.add('active');
        
    } catch (error) {
        hidePrelaoder()
        const span = document.createElement('span')
        span.classList.add('error');
        span.textContent = `Город c названием ${city} не найден или проверьте качество соединения!!!`;
        inputSearch.before(span);
        setTimeout(() =>{
            span.remove();
        },3000);
    }
}            

function createCard(name, text, icon,temperature, pressure, convertedTime) {
    const prevCard = document.querySelector('.field_town_properties');
    if(prevCard) prevCard.remove();

    const html = `<div class="field_town_properties">

                        <div class="field_back">
                            <button class="field_btn_back">
                                <img src="/Icons/back.svg" alt="back"> Назад
                            </button>
                            <div class="bookmarkBtn">
                                <input type="checkbox" class="bookmark1"/>
                            </div>
                        </div>

                        <h3 class="field_town">${name}</h3>
                        <div class="field_condition">${text}</div>
                            <div class="field_temperature">
                                <div class="temperature">${Math.round(temperature)}°</div>
                                <div class="temperature_img"><img src="${icon}" alt="weather_icon"></div>
                            </div>
                        <div class="field_pressure">
                            <img src="/Icons/barometer 1.svg" alt="pression_icon">
                            <span>${Math.round(pressure * 0.75)} мм рт.ст.</span>
                        </div>
                        <div class = "field_sunset_time">Закат в ${convertedTime}</div>

                 </div>`;

    const fieldContainer = document.querySelector('.field_container');
    fieldContainer.insertAdjacentHTML('afterbegin', html);
    
    const btnBack = fieldContainer.querySelector('.field_btn_back')
    btnBack.addEventListener('click', () => {
        weatherInfo.classList.remove("active")
    })

    const bookmarkBtn = fieldContainer.querySelector('.bookmark1')
    bookmarkBtn.addEventListener('click', () => {
        if(bookmarkBtn.checked) {
            return saveCard(name, temperature, icon)
        }
    })


    cities.filter(citi => {
        if(citi.cityName == name) {
            bookmarkBtn.style.display = 'none'
        }
        
    })
}

function saveCard (name, temperature, icon) {
    
        const card = `<div class="card">
                            <div class="card_city">${name}</div>
                            <div class="card_temperature">${Math.round(temperature)}<sup>°</sup></div>
                            <div class="card_icon"><img src="${icon}" alt="weather-icon"></div>
                      </div>`           
                      fieldCards.insertAdjacentHTML('beforeend', card);
        
        if(choiceIzhevsk) choiceIzhevsk.remove()


        const cityWeather = {
            cityName: name,
            cityTemperature: temperature,
            cityIcon:icon
        }

        cities.push(cityWeather);
        saveToLocalStorage()
}

function convertTime12to24 (time12h) {
    const [time, modifier] = time12h.split(" ");
  
    let [hours, minutes] = time.split(":");
  
    if (hours === "12") {
      hours = "00";
    }
  
    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }
  
    return `${hours}:${minutes}`;
};


function saveToLocalStorage() {
    localStorage.setItem('citiesWeather', JSON.stringify(cities))
}


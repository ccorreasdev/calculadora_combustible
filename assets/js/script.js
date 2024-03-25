//https://datos.gob.es/es/catalogo/e05068001-precio-de-carburantes-en-las-gasolineras-espanolas
//https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/
const layoutTitle = document.querySelector(".layout__title");
const startInput = document.querySelector("#start-input");
const endInput = document.querySelector("#end-input");
const buttonGo = document.querySelector("#button-go");
const startCoord = document.querySelector("#start-coord");
const endCoord = document.querySelector("#end-coord");
const pathDistance = document.querySelector("#path-distance");
const pathTime = document.querySelector("#path-time");
const pathPrice = document.querySelector("#path-price");
const locationLayout = document.querySelector("#location-layout");
const fuelGasoleo = document.querySelector("#fuel-gasoleo");
const fuelGasolina = document.querySelector("#fuel-gasolina")
const fuelConsumo = document.querySelector("#consumo");
const pathRoute = document.querySelector("#path-route");


fuelGasoleo.addEventListener("click", (e) => {
    fuelGasoleo.classList.add("fuel--active");
    fuelGasolina.classList.remove("fuel--active");
});

fuelGasolina.addEventListener("click", (e) => {
    fuelGasoleo.classList.remove("fuel--active");
    fuelGasolina.classList.add("fuel--active");
});

buttonGo.addEventListener("click", async (e) => {

    const startPath = startInput.value;
    const endPath = endInput.value;
    const consumo = fuelConsumo.value;

    if (startPath && endPath) {

        pathRoute.classList.remove("layout__img-container-route");
        pathRoute.classList.add("hide");

        setTimeout(() => {
            pathRoute.classList.add("layout__img-container-route");
            pathRoute.classList.remove("hide");
        }, 10);


        startInput.classList.remove("input--error");
        endInput.classList.remove("input--error");

        pathTime.innerHTML = ` <div class="loading">
        <div class="loading__dot-1"></div>
        <div class="loading__dot-2"></div>
        <div class="loading__dot-3"></div>
    </div>`;

        pathDistance.innerHTML = ` <div class="loading">
        <div class="loading__dot-1"></div>
        <div class="loading__dot-2"></div>
        <div class="loading__dot-3"></div>
    </div>`;

        pathPrice.innerHTML = ` <div class="loading">
        <div class="loading__dot-1"></div>
        <div class="loading__dot-2"></div>
        <div class="loading__dot-3"></div>
    </div>`;

        console.log(startPath, endPath);

        const startCoords = await getGeocode(startPath);
        const endCoords = await getGeocode(endPath);

        // startCoord.innerHTML = `${startCoords.location.lat} , ${startCoords.location.lng}`;
        // endCoord.innerHTML = `${endCoords.location.lat} , ${endCoords.location.lng}`;

        startCoord.innerHTML = `${startCoords.address}`;
        endCoord.innerHTML = `${endCoords.address}`;
        console.log(startCoords);

        pathData = await calculateDistance(startCoords.location.lat, startCoords.location.lng, endCoords.location.lat, endCoords.location.lng);

        pathDistance.innerHTML = `${(pathData.distances / 1000).toFixed(2)} kilometros`;

        if (((pathData.durations / 60) / 60).toFixed(0) > 0) {
            pathTime.innerHTML = `${((pathData.durations / 60) / 60).toFixed(0)} horas ${((pathData.durations / 60) % 60).toFixed(0)} minutos`;
        } else {
            pathTime.innerHTML = `${((pathData.durations / 60) % 60).toFixed(0)} minutos`;
        }


        const stations = await getFuelPrices();
        const stationsList = stations.ListaEESSPrecio;

        console.log(stationsList);

        const station = stationsList.filter((station) => {
            if (station["C.P."] == "03670") {
                console.log(station);
                return station;
            }

        })

        console.log(station)
        console.log(parseFloat(station[0]["Precio Gasoleo A"]));

        if (fuelGasoleo.classList.contains("fuel--active")) {
            fuelSelected = "Precio Gasoleo A";
        } else {
            fuelSelected = "Precio Gasolina 95 E5";
        }

        const fuelPrice = ((pathData.distances / 1000) * consumo / 100) * parseFloat(station[0][fuelSelected].replace(",", "."));
        pathPrice.innerHTML = fuelPrice.toFixed(2) + " €";

    } else {
        startInput.classList.add("input--error");
        endInput.classList.add("input--error");

        locationLayout.classList.add("location__layout");
        locationLayout.classList.remove("location__layout--ok");
    }




})

const getFuelPrices = async () => {
    console.log("GET FUEL PRICES")
    const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/`;
    const options = {
        method: 'GET',
        headers: {

        }
    };

    try {
        const response = await fetch(url);
        const jsonResponse = await response.json();
        return jsonResponse;
    } catch (error) {
        console.error(error);
    }
}

const calculateDistance = async (lat1, lng1, lat2, lng2) => {
    const url = `https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix?origins=${lat1}%2C%20${lng1}&destinations=${lat2}%2C%20${lng2}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'c2e1b6bb4bmsh2b299d7e955e076p18106ejsnddd4891568c0',
            'X-RapidAPI-Host': 'trueway-matrix.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();
        console.log(result);
        const jsonResult = await JSON.parse(result);
        console.log(jsonResult.distances);
        return jsonResult;
    } catch (error) {
        console.error(error);
    }
}


const getGeocode = async (address) => {
    const url = `https://trueway-geocoding.p.rapidapi.com/Geocode?address=${address.replace(/ /g, "%20")}&language=es`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'c2e1b6bb4bmsh2b299d7e955e076p18106ejsnddd4891568c0',
            'X-RapidAPI-Host': 'trueway-geocoding.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();
        const jsonResult = await JSON.parse(result)
        console.log(jsonResult.results[0]);
        return jsonResult.results[0];
    } catch (error) {
        console.error(error);
    }
}


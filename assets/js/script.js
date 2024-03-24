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

buttonGo.addEventListener("click", async (e) => {

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

    const startPath = startInput.value;
    const endPath = endInput.value;

    console.log(startPath, endPath);

    const startCoords = await getGeocode(startPath);
    const endCoords = await getGeocode(endPath);

    startCoord.innerHTML = `${startCoords.lat} , ${startCoords.lng}`;
    endCoord.innerHTML = `${endCoords.lat} , ${endCoords.lng}`;
    console.log(startCoords);

    pathData = await calculateDistance(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);

    pathDistance.innerHTML = `${(pathData.distances / 1000).toFixed(2)} kilometros`;
    pathTime.innerHTML = `${(pathData.durations / 60).toFixed(2)} minutos`

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

    const fuelPrice = ((pathData.distances / 1000) * 4 / 100) * parseFloat(station[0]["Precio Gasoleo A"].replace(",", "."));
    pathPrice.innerHTML = fuelPrice.toFixed(2) + " €";


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
        return jsonResult.results[0].location;
    } catch (error) {
        console.error(error);
    }
}


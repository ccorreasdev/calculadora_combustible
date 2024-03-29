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
const mapLayout = document.querySelector("#map");
const map2Layout = document.querySelector("#map-2");
const fuelIcon = document.querySelector("#fuel-icon");
const chartIcon = document.querySelector("#chart-icon");
const stationsLayout = document.querySelector("#stations-layout");
const chartLayout = document.querySelector("#chart-layout");
const closeWindow = document.querySelector("#close-window");
const closeChart = document.querySelector("#close-chart");
const stationsTableRow = document.querySelector("#station-table-row");
const stationCity = document.querySelector("#station-city");
const chartStations = document.querySelector("#chart");
const data = [];


const chart = () => {

    // Specify the chart’s dimensions, based on a bar’s height.
    const barHeight = 25;
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 10;
    const marginLeft = 30;
    const width = 928;
    const height = Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

    // Create the scales.
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.precioMedio)])
        .range([marginLeft, width - marginRight]);

    const y = d3.scaleBand()
        .domain(d3.sort(data, d => -d.precioMedio).map(d => d.provincia))
        .rangeRound([marginTop, height - marginBottom])
        .padding(0.1);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 30px sans-serif;");

    // Append a rect for each provincia.
    svg.append("g")
        .attr("fill", "steelblue")
        .selectAll()
        .data(data)
        .join("rect")
        .attr("x", x(0))
        .attr("y", (d) => y(d.provincia))
        .attr("width", (d) => x(d.precioMedio) - x(0))
        .attr("height", y.bandwidth());

    // Append a label for each provincia.
    svg.append("g")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .selectAll()
        .data(data)
        .join("text")
        .attr("x", (d) => x(d.precioMedio))
        .attr("y", (d) => y(d.provincia) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", -4)
        .text((d) => `${d.precioMedio} €`) // Cambiar el formato del texto a euros
        .call((text) => text.filter(d => x(d.precioMedio) - x(0) < 20) // short bars
            .attr("dx", +4)
            .attr("fill", "black")
            .attr("text-anchor", "start"));

    // Create the axes.
    svg.append("g")
        .attr("transform", `translate(0,${marginTop})`)
        .call(d3.axisTop(x).ticks(width / 80).tickFormat(d => `${d} €`)) // Cambiar el formato del texto a euros
        .call(g => g.select(".domain").remove());

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll(".tick text")
        .style("font-size", "25px");

    return svg.node();

};


const chart2 = () => {
    // Declare the chart dimensions and margins.
    const width = 3000;
    const height = 1000;
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 40;

    // Declare the x (horizontal position) scale.
    const x = d3.scaleBand()
        .domain(d3.groupSort(data, ([d]) => -d.precioMedio, (d) => d.provincia)) // descending precioMedio
        .range([marginLeft, width - marginRight])
        .padding(0.1);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.precioMedio)])
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add a rect for each bar.
    svg.append("g")
        .attr("fill", "steelblue")
        .selectAll()
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.provincia))
        .attr("y", (d) => y(d.precioMedio))
        .attr("height", (d) => y(0) - y(d.precioMedio))
        .attr("width", x.bandwidth());

    // Add the x-axis and label.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("y", function (d, i) {
            return i % 2 === 0 ? 12 : 24; // Alternar el margen superior de las etiquetas
        });

    // Add the y-axis and label, and remove the domain line.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ precioMedio (%)"));

    // Return the SVG element.
    return svg.node();
}



let map = L.map('map').setView([40.416748, -3.703786], 6);
let map2 = L.map('map-2').setView([40.416748, -3.703786], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);

closeChart.addEventListener("click", (e) => {

});

stationCity.addEventListener("input", async (e) => {
    console.log("Writing ", e.target.value);

    await loadFuelStations(e.target.value);

})

const loadFuelStations = async (locality = "Monforte del Cid") => {
    map2.eachLayer(function (layer) {
        layer.remove();
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map2);

    const fuelStations = await getFuelPrices();

    console.log("AQUI:", fuelStations)

    // fuelStations.forEach((station) => {
    //     L.marker([station["Latitud"].replace(",", "."), station["Longitud (WGS84)"].replace(",", ".")]).addTo(map2);
    // });

    stationsTableRow.innerHTML = "";

    let isFirstRow = true;
    let isDifferentRow = false;
    let rowClass = "table__row";

    for (let i = 0; i < fuelStations.length; i++) {
        // setTimeout(() => {
        //     L.marker([fuelStations[i]["Latitud"].replace(",", "."), fuelStations[i]["Longitud (WGS84)"].replace(",", ".")]).addTo(map2);
        // }, 10 * i)

        if (fuelStations[i]["Localidad"] === locality.toUpperCase()) {
            L.marker([fuelStations[i]["Latitud"].replace(",", "."), fuelStations[i]["Longitud (WGS84)"].replace(",", ".")]).addTo(map2);


            if (isDifferentRow) {
                rowClass = "table__row"
            } else {
                rowClass = "table__row-2"
            }

            stationsTableRow.innerHTML += ` <div class="table__row-container">
            <div class="${rowClass}">${fuelStations[i]["Localidad"]}</div>
            <div class="${rowClass}">${fuelStations[i]["Dirección"]}</div>
            <div class="${rowClass}">${fuelStations[i]["Rótulo"]}</div>
            <div class="${rowClass}">${fuelStations[i]["Precio Gasoleo A"]}€</div>
            <div class="${rowClass}">${fuelStations[i]["Precio Gasolina 95 E5"]}€</div>
            </div>`;

            isDifferentRow = !isDifferentRow;

        }

    }
}

closeWindow.addEventListener("click", async (e) => {
    stationsLayout.classList.remove("stations__layout--active");
});

closeChart.addEventListener("click", (e) => {
    chartLayout.classList.remove("chart__layout--active");
})

fuelIcon.addEventListener("click", async (e) => {
    await loadFuelStations();
    stationsLayout.classList.toggle("stations__layout--active");

});

chartIcon.addEventListener("click", (e) => {
    chartLayout.classList.toggle("chart__layout--active");
})

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

        generateMap(startCoords.location.lat, startCoords.location.lng, endCoords.location.lat, endCoords.location.lng, startCoords.locality, endCoords.locality);

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
        const stationsList = stations;

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
    //const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/`;
    const url = "./assets/js/EstacionesTerrestres.json"
    const options = {
        method: 'GET',
        headers: {

        }
    };

    try {
        const response = await fetch(url);
        const jsonResponse = await response.json();
        //await createFileJSON(jsonResponse);
        //return jsonResponse;
        console.log(jsonResponse["PreciosEESSTerrestres"]["ListaEESSPrecio"]["EESSPrecio"]);
        return jsonResponse["PreciosEESSTerrestres"]["ListaEESSPrecio"]["EESSPrecio"];
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


const createFileJSON = async (jsonData) => {
    let blob = new BlobEvent([jsonData], { type: "applicantion/json" });

    let fileURL = URL.createObjectURL(blob);

    let downloadLink = document.createElement("a");

    downloadLink.href = fileURL;
    downloadLink.download = "fuelStations.json";
    downloadLink.innerText = "Descargar archivo";

    document.body.appendChild(downloadLink);

}

const generateMap = (lat1, lng1, lat2, lng2, locality1, locality2) => {

    let latExample = lat1;
    let lngExample = lng1;
    let latExample2 = lat2;
    let lngExample2 = lng2;
    let marker1;
    let marker2;


    map.eachLayer(function (layer) {
        layer.remove();
    });

    // let latExample = 36.721282;
    // let lngExample = -4.421287;
    // let latExample2 = 43.463661;
    // let lngExample2 = -3.822621;

    let meanLat = (latExample + latExample2) / 2;
    let meanLng = (lngExample + lngExample2) / 2;


    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let startPoint = [lat1, lng1];
    let endPoint = [lat2, lng2];

    L.polyline([startPoint, endPoint], { color: "blue" }).addTo(map);

    map.fitBounds([[lat1, lng1], [lat2, lng2]]);

    marker1 = L.marker([latExample, lngExample]).addTo(map);
    marker2 = L.marker([latExample2, lngExample2]).addTo(map);

}

const loadChartData = async () => {
    console.log("Load Chart Data");
    let stationsList = await getFuelPrices();
    let isDifferentProvince = true;
    let lastProvince = "";
    let counterProvince = 0;
    let accumulatedGasoleo = 0;

    stationsList.forEach((station) => {

        console.log(station["Provincia"]);

        if (station["Provincia"] != lastProvince) {
            console.log("Ultima provincia: ", lastProvince);
            console.log("Numero de estaciones en provincia: ", counterProvince);
            console.log("Acumulado Gasoleo A: ", accumulatedGasoleo);
            console.log("Media Gasoleo A: ", accumulatedGasoleo / counterProvince);
            const dataProvince = {
                provincia: lastProvince,
                precioMedio: ((accumulatedGasoleo / counterProvince).toFixed(2)) * 1,
            }
            data.push(dataProvince);
            lastProvince = station["Provincia"];
            counterProvince = 0;
            accumulatedGasoleo = 0;
        } else {
            counterProvince++;

            if (station["Precio Gasoleo A"]) {
                accumulatedGasoleo += parseFloat(station["Precio Gasoleo A"].replace(",", "."));
            }

        }


    });

    console.log("Data: ", data);
    data.shift();
    const svgElement = chart(data);

    chartStations.appendChild(svgElement);

};

loadChartData();
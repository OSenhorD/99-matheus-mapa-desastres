// Adicione aqui o caminho das imagens para cada tipo de marcador
const images = {
    "Battles": "images/battle.png",
}

// Não alterar
var map = null
var markers = []

const loading = (show = true) => {
    const block = document.getElementById("block")
    if (block) {
        block.style.display = show ? "none" : ""
    }

    const loading = document.getElementById("loading")
    if (loading) {
        loading.style.display = show ? "block" : "none"
    }
}

const getData = async () => {
    loading(true)

    let items = []
    try {
        const url = `https://mapaconflitos.com/wardata`
        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
        })
        const data = await response.json()
        items = data && data.status == 200 && data.success && Array.isArray(data.data) ? data.data : []
    } catch (error) {
        console.log("Erro ao carregar dados da API")
        console.log(error)
    }

    loading(false)
    return items
}

const startMap = async () => {
    const items = await getData()

    const center = items.length == 0
        ? [-23.563113336677063, -46.64004646220451]
        : [items[0].latitude, items[0].longitude]

    map = L.map('map')
        .setView(center, 13)
        .setMinZoom(3)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)


    markers = []
    for (const item of items) {
        const iconUrl = images[item.event_type]
        const icon = iconUrl ? L.icon({ iconUrl, iconSize: [50, 50] }) : null
        const maker = L.marker([item.latitude, item.longitude], iconUrl ? { icon } : null)
            .addTo(map)
            .bindPopup(`${item.notes}`)
        markers.push(maker)
    }

    buildOptions(items)
}

const center = (item = {}) => {
    map.setView([item.latitude, item.longitude], 13)

    const marker = markers.find(marker => marker._latlng.lat == item.latitude && marker._latlng.lng == item.longitude)
    if (!marker) return

    marker.openPopup()
}

const buildOptions = (items = []) => {
    const cities = document.getElementById("cities")
    if (!cities) {
        console.log(`Elemento "cities" não encontrado`)
        return
    }

    items = items.sort((a, b) => a.country > b.country ? 1 : (a.country < b.country ? - 1 : 0))

    while (items.length > 0) {
        const country = items[0].country
        const state = items
            .filter(item => item.country == country)
            .sort((a, b) => a.admin1 > b.admin1 ? 1 : (a.admin1 < b.admin1 ? - 1 : 0))
        [0].admin1

        const city = items
            .filter(item => item.country == country && item.admin1 == state)
            .sort((a, b) => a.admin2 > b.admin2 ? 1 : (a.admin2 < b.admin2 ? - 1 : 0))
        [0].admin2

        const occurrences = items
            .filter(item => item.country == country && item.admin1 == state && item.admin2 == city)
            .sort((a, b) => {
                const dateA = new Date(`${a.event_date} 00:00:00`)
                const dateB = new Date(`${b.event_date} 00:00:00`)
                return dateA.getTime() > dateB.getTime() ? 1 : (dateA.getTime() < dateB.getTime() ? - 1 : 0)
            })

        items = items
            .filter(item => !(item.country == country && item.admin1 == state && item.admin2 == city))

        const div = document.createElement("div")
        div.classList.add("city")
        div.innerHTML = `${country} - ${state} - ${city}`

        for (const occurrence of occurrences) {
            const spanDate = document.createElement("span")
            spanDate.innerHTML = `${occurrence.event_date}`

            const spanType = document.createElement("span")
            spanType.classList.add("type")
            spanType.innerHTML = `${occurrence.disorder_type}`

            const divOccurrence = document.createElement("div")
            divOccurrence.classList.add("occurrence")
            divOccurrence.appendChild(spanDate)
            divOccurrence.appendChild(spanType)

            divOccurrence.addEventListener("click", () => center(occurrence))

            div.appendChild(divOccurrence)
        }

        cities.appendChild(div)
    }
}

startMap()

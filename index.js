var map = null
var markers = []

const getData = async () => {
    try {
        const url = `http://mapaconflitos.com/wardata`
        const response = await fetch(url)
        const data = await response.json()
        return data && data.status == 200 && data.success && Array.isArray(data.data) ? data.data : []
    } catch (error) {
        console.log("Erro ao carregar dados da API")
        console.log(error)
        return []
    }
}

const startMap = async () => {
    const items = await getData()

    const center = items.length == 0
        ? [-23.563113336677063, -46.64004646220451]
        : [items[0].latitude, items[0].longitude]

    map = L.map('map')
        .setView(center, 13)
        .setMinZoom(5)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    markers = []
    for (const item of items) {
        const maker = L.marker([item.latitude, item.longitude])
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
    const doc = document.getElementById("options")
    if (!doc) {
        console.log(`Elemento "options" não encontrado`)
        return
    }

    items = items.sort((a, b) => a.admin1 > b.admin1 ? 1 : (a.admin1 < b.admin1 ? - 1 : 0))

    while (items.length > 0) {
        const state = items[0].admin1
        const city = items
            .filter(item => item.admin1 == state)
            .sort((a, b) => a.admin2 > b.admin2 ? 1 : (a.admin2 < b.admin2 ? - 1 : 0))
        [0].admin2

        const occurrences = items.filter(item => item.admin1 == state && item.admin2 == city)
        items = items
            .filter(item => !(item.admin1 == state && item.admin2 == city))
            .sort((a, b) => {
                const dateA = new Date(`${a.event_date} 00:00:00`)
                const dateB = new Date(`${b.event_date} 00:00:00`)
                return dateA.getTime() > dateB.getTime() ? 1 : (dateA.getTime() < dateB.getTime() ? - 1 : 0)
            })

        const div = document.createElement("div")
        div.classList.add("city")
        div.innerHTML = `${state} - ${city}`

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

        doc.appendChild(div)
    }
}

startMap()

const zones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4']
const statuses = ['Waiting', 'In progress', 'Deprecate']

const cities = [
  {name: 'Zurich', lat: 47.3769, lng: 8.5417},
  {name: 'Geneva', lat: 46.2044, lng: 6.1432},
  {name: 'Basel', lat: 47.5596, lng: 7.5886},
  {name: 'Bern', lat: 46.948, lng: 7.4474},
  {name: 'Lausanne', lat: 46.5197, lng: 6.6323},
]

const getRandomCity = () => {
  const randomIndex = Math.floor(Math.random() * cities.length)
  return cities[randomIndex]
}

export const markers = Array.from({length: 20}, (c, index) => {
  const city = getRandomCity()
  const lat = city.lat + (Math.random() - 0.5) * 0.4
  const lng = city.lng + (Math.random() - 0.5) * 0.4
  const zone = zones[Math.floor(Math.random() * zones.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const id = Date.now()

  return {
    lat,
    lng,
    zone,
    status,
    id,
    description: 'This is a test',
    city: city.name,
  }
})

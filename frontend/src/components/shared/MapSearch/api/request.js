const token = 'AIzaSyDNcOVNaruADFlD-IucNxNRP88h4MBNpAs'

export async function request(service, params) {
  try {
    return {success: true, result: await (await fetch(buildRequestUrl(service, params))).json()}
  } catch (e) {
    return {success: false, result: e.message}
  }
}

function buildRequestUrl(params) {
  params = params || {}
  params.query = params.query || ''
  params.type = params.type || 'json'
  params.service = params.service || 'place/autocomplet'

  return `https://maps.googleapis.com/maps/api/${params.service}/${params.type}?key=${token}&libraries&${params.query}`
}

import streetImg from './assets/ic_default_colors2-1x.png'
import satelliteImg from './assets/ic_satellite-1x.png'
import terrainImg from './assets/ic_terrain-1x.png'
const baselayers = [
    // { 
    //   title: 'satellite' ,  
    //   uri:'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    //   params: {subdomains:['mt0','mt1','mt2','mt3'] }
    // },
    {
      title: 'street' , 
      label: 'Par défaut',
      uri:'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      image: streetImg,
      params: {subdomains:['mt0','mt1','mt2','mt3']}
    },
    {
      title: 'terrain' ,
      label: 'Rélief', 
      uri:'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      image: terrainImg,
      params: { subdomains:['mt0','mt1','mt2','mt3']}
    },
    {
        title: 'satellite' , 
        label: 'Satellite',
        uri:'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
        image: satelliteImg,
        params: { subdomains:['mt0','mt1','mt2','mt3']}
    }
]

export const defaultLayer = {
    title: 'street' , 
    uri:'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    params: {subdomains:['mt0','mt1','mt2','mt3']}
}
export default  baselayers
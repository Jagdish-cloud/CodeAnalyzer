import React from 'react';
import { createRoot } from "react-dom/client";
import {APIProvider, Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';

const App = () => (

<APIProvider apiKey={'AIzaSyBujSZvWEnauXhd-bJQ7wjD2rho1qKUwf8'} onLoad={() => console.log('Maps API has loaded.')}>
<Map
 defaultZoom={13}
 defaultCenter={ { lat: 12.907974564043526, lng:  77.57370469559991 } }
 onCameraChanged={ (ev: MapCameraChangedEvent) =>
   console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
 }>
</Map>
</APIProvider>



);

const root = createRoot(document.getElementById('app'));
root.render(<App />);

export default App;
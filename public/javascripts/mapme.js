document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('button');
  button.addEventListener('click', async (event) => {
    const fileInput = document.querySelector('input[type="file"]').files[0];
    const fileReader = new FileReader();
    fileReader.addEventListener('load', async (event) => {
      const csvString = event.target.result;
      const parsedCsvString = await Papa.parse(csvString, { header: true} ).data;
      MapWorker.createMap(parsedCsvString);
    });
    fileReader.readAsText(fileInput);
  });
});

class MapWorker {
  static async createMap(parsedCsvString) {
    const position = { lat: Number(parsedCsvString[0]['Latitude']), lng: Number(parsedCsvString[0]['Longitude']) };
    const { Map } = await google.maps.importLibrary('maps');
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

    const map = new Map(document.getElementById('map'), {
      zoom: 12,
      center: position,
      mapId: 'New Map',
    });

    const geocoder = new google.maps.Geocoder();
    parsedCsvString.forEach(async (csvRow) => {
      let position = { lat: Number(csvRow['Latitude']), lng: Number(csvRow['Longitude']) };
      let marker = new AdvancedMarkerElement({
        position,
        map: map,
      });
    });
  }
}
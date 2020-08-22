parasails.registerPage('trip', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    coordinatesInView: [],
    coordinates: [],
    videoUrl: '',
    map: null,
    token: 'pk.eyJ1IjoiYWxiZXJ0b2x1bmEiLCJhIjoiY2tlNWxxa3RtMTQxZjJzbGY0ZnVibmExaiJ9.XfvSfiBOzbYoMJnnL7OtBw'
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //...
  },
  mounted: async function() {
    this.videoElement = document.getElementById('video');
    const { latitude, longitude, tripId } = document.getElementById('map').dataset;
    this.tripId = tripId;
    this.map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: this.token
    }).addTo(this.map);
    this.map.on('moveend', () => {
      this.updateMapMarkers();
    });
    this.map.on('zoomend', () => {
      this.updateMapMarkers();
    });
    this.updateMapMarkers();
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    async updateMapMarkers() {
      if (!this.map) {
        return;
      }
      const bounds = this.map.getBounds();
      const southEast = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();
      const lat1 = southEast.lat;
      const lng1 = southEast.lng;
      const lat2 = northEast.lat;
      const lng2 = northEast.lng;
      let response = await fetch(`/api/v1/trips/${this.tripId}/coordinates?lat1=${lat1}&lat2=${lat2}&lng1=${lng1}&lng2=${lng2}`, { credentials: 'include' });
      response = await response.json();
      this.coordinates = response;
      response.forEach(({ latitude, longitude, id }) => {
        if (this.coordinatesInView.includes(id)) {
          return;
        }
        const marker = L.marker([latitude, longitude]);
        marker.coordinateId = id;
        marker.addTo(this.map);
        marker.on('click', this.onMarkerClick);
        this.coordinatesInView.push(id);
      });
      this.map.eachLayer((layer) => {
        if (layer.coordinateId !== undefined && layer.getLatLng && !bounds.contains(layer.getLatLng())) {
          this.map.removeLayer(layer);
          this.coordinatesInView.splice(this.coordinatesInView.indexOf(layer.coordinateId), 1);
        }
      });
    },
    async onMarkerClick(event) {
      if (!this.videoElement) {
        return;
      }
      const markerId = event.target.coordinateId;
      if (markerId === undefined) {
        return;
      }
      const coordinate = this.coordinates.find(({ id }) => id === markerId);
      if (!coordinate) {
        return;
      }
      this.videoUrl = this.getVideoUrl(coordinate.videoFileName);
      let response = await fetch(`/api/v1/coordinates/${markerId}/video-second`);
      response = await response.text();
      this.videoElement.addEventListener('canplay', () => {
        this.videoElement.play();
        this.videoElement.currentTime = response;
      }, { once: true });
    },
    getVideoUrl(videoFileName) {
      return `https://video.albertoluna.es/${videoFileName}`;
    }
  }
});

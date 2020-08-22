module.exports = {


  friendlyName: 'Upload trip',


  description: '',


  inputs: {
    name: {
      description: 'Name of the trip',
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 20,
    },

    file: {
      description: 'File with all the coordinates for this trip',
      type: 'json',
      required: true
    },
  },


  exits: {
    success: {
      responseType: 'view',
      viewTemplatePath: 'pages/dashboard/welcome'
    },
    invalidFile: {
      description: 'File format is not valid',
      responseType: 'badRequest'
    }
  },


  fn: async function ({ name, file }) {
    var tripLogFile;
    try {
      tripLogFile = JSON.parse(file);
    } catch(err) {
      sails.log.error('File is not JSON', err);
      throw 'invalidFile';
    }

    if (!Array.isArray(tripLogFile)) {
      sails.log.error('File is not an array')
      throw 'invalidFile';
    }

    let coordinates = tripLogFile.map(({ videoFileName, coordinates, date }) => {
      if (!videoFileName || !coordinates || coordinates.speed === undefined || !coordinates.latitude || !coordinates.longitude) {
        sails.log.error('Invalid coordinate', { videoFileName, coordinates, date });
        throw 'invalidFile';
      }
      return {
        videoFileName,
        date,
        speed: coordinates.speed,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    });

    const trip = await Trip.create({ name, user: this.req.me.id }).fetch();

    coordinates = tripLogFile.map(({ videoFileName, coordinates, date }) => {
      return {
        trip: trip.id,
        videoFileName,
        date,
        speed: coordinates.speed,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    });

    await Coordinate.createEach(coordinates);


    // All done.
    return;

  }


};

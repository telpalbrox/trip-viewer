module.exports = {


  friendlyName: 'Get coordinates',


  description: '',


  inputs: {

  },


  exits: {
    missingLatitude: {
      description: 'Missing latitude',
      statusCode: 400
    },
    missingLongitude: {
      description: 'Missing longitude',
      statusCode: 400
    },
    invalidLatitude: {
      description: 'Invalid latitude',
      statusCode: 400
    },
    invalidLongitude: {
      description: 'Invalid longitude',
      statusCode: 400
    }
  },


  fn: async function () {
    const trip = await Trip.findOne({ id: this.req.params.id });

    if (!trip) {
      throw 'notFound';
    }

    if (trip.user !== this.req.me.id) {
      throw 'notAuthorized';
    }

    const latitude1Raw = this.req.query.lat1;
    const longitude1Raw = this.req.query.lng1;
    const latitude2Raw = this.req.query.lat2;
    const longitude2Raw = this.req.query.lng2;

    if (!latitude1Raw || !latitude2Raw) {
      throw 'missingLatitude';
    }

    if (!longitude1Raw || !longitude2Raw) {
      throw 'missingLatitude';
    }

    const latitude1 = Number.parseFloat(latitude1Raw);
    const latitude2 = Number.parseFloat(latitude2Raw);
    const longitude1 = Number.parseFloat(longitude1Raw);
    const longitude2 = Number.parseFloat(longitude2Raw);

    if (Number.isNaN(latitude1) || Number.isNaN(latitude2)) {
      throw 'invalidLatitude';
    }

    if (Number.isNaN(longitude1) || Number.isNaN(longitude2)) {
      throw 'invalidLatitude';
    }

    const coordinates = await Coordinate.find({ trip: trip.id });

    const result = coordinates.filter(({ latitude, longitude, speed }) => {
      return speed > 0 && latitude > latitude1 && latitude < latitude2 && longitude > longitude1 && longitude < longitude2;
    });

    return result;

  }


};

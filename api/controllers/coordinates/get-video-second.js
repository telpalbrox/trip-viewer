module.exports = {


  friendlyName: 'Get video second',


  description: '',


  inputs: {

  },


  exits: {
    notFound: {
      statusCode: 404
    },
    notAuthorized: {
      description: 'User is trying to view the trip of another user.',
      statusCode: 401
    },
  },


  fn: async function () {
    const coordinate = await Coordinate.findOne({ id: this.req.params.id });
    if (!coordinate) {
      throw 'notFound';
    }

    const trip = await Trip.findOne({ id: coordinate.trip }).populate('coordinates', { videoFileName: coordinate.videoFileName });
    if (!trip) {
      throw 'notFound';
    }

    if (trip.user !== this.req.me.id) {
      throw 'notAuthorized';
    }

    const coordinateIndex = trip.coordinates.findIndex(({ id }) => coordinate.id === id);
    if (coordinate === null) {
      throw 'notFound';
    }

    // All done.
    return coordinateIndex * 4;
  }


};

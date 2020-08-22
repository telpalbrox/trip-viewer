module.exports = {


  friendlyName: 'View trip',


  description: 'Display "Trip" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/trips/trip'
    },
    notAuthorized: {
      description: 'User is trying to view the trip of another user.',
      statusCode: 401
    },
    notFound: {
      description: 'Trip not found',
      statusCode: 404
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

    const firstCoordinates = await Coordinate.find({
      where: { trip: trip.id },
      limit: 1
    });

    // Respond with view.
    return {
      trip,
      firstCoordinate: firstCoordinates[0]
    };

  }


};

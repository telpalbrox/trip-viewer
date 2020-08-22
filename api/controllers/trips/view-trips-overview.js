module.exports = {


  friendlyName: 'View trips overview',


  description: 'Display "Trips overview" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/trips/trips-overview'
    }

  },


  fn: async function () {
    const trips = await Trip.find({
      user: this.req.me.id
    });

    const viewTrips = [];
    for (let trip of trips) {
      const coordinatesCount = await Coordinate.count({ trip: trip.id });
      viewTrips.push({...trip, coordinatesCount});
    }

    // Respond with view.
    return {
      trips: viewTrips
    };

  }


};

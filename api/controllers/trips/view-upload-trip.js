module.exports = {


  friendlyName: 'View upload trip',


  description: 'Display "Upload trip" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/trips/upload-trip'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};

'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'exchanges',
      'questionDeliveryConfirmedAt',
      Sequelize.DATE
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'exchanges',
      'questionDeliveryConfirmedAt'
    );
  }
};

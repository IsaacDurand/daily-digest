'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'exchanges',
      'AdditionalAnswerId',

      // TODO: Is this the correct way to add a column that's a foreign key?
      Sequelize.INTEGER
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'exchanges',
      'AdditionalAnswerId'
    );
  }
};

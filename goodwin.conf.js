module.exports = function(config) {
  config.set({
    globals: {
      oath: require('./index')
    },
    tests: [
      'test/*.js'
    ]
  });
};

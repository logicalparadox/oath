module.exports = function(goodwin) {
  goodwin.set({
    globals: {
      oath: require('./index')
    }
  });
};

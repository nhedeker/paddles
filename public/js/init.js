'use strict';

(function() {
  window.COOKIES = {};
    document.cookie.split('; ').forEach((prop) => {
      const propKey = prop.split('=')[0];
      const propValue = prop.split('=')[1];

      window.COOKIES[propKey] = propValue;
    });
})();

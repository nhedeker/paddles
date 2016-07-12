'use strict';

(function() {
  window.COOKIES = {};
  document.cookie.split('; ').forEach((prop) => {
    const propKey = prop.split('=')[0];
    const propValue = prop.split('=')[1];

    window.COOKIES[propKey] = propValue;
  });

  if (window.COOKIES.loggedIn) {
    $('.session').text('Logout').click((_event) => {
      const $xhr = $.ajax({
        url: '/session',
        type: 'DELETE'
      });

      $xhr.done(() => {
        if ($xhr.status !== 200) {
          return Materialize.toast('Unable to log out. Please try again.');
        }

        window.location.href = '/';
      });

      $xhr.fail(() => {
        Materialize.toast('Unable to log out. Please try again.');
      });
    });
  }
})();

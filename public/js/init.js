'use strict';

(function() {
  window.COOKIES = {};
  document.cookie.split('; ').forEach((prop) => {
    const propKey = prop.split('=')[0];
    const propValue = prop.split('=')[1];

    window.COOKIES[propKey] = propValue;
  });

  if (window.COOKIES.loggedIn) {
    $('.sessionLogout').click((_event) => {
      const $xhr = $.ajax({
        url: '/session',
        type: 'DELETE'
      });

      $xhr.done(() => {
        window.location.href = '/';
      });

      $xhr.fail(() => {
        Materialize.toast('Unable to log out. Please try again.', 3500);
      });
    });
  }
  $('.button-collapse').sideNav();
})();

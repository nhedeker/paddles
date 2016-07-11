(function() {
  'use strict';

  $('.login-button').click((_event) => {
    const playerEmail = $('#email').val().trim();
    const playerPassword = $('#password').val();
    console.log(playerEmail, playerPassword);

    if (!playerEmail) {
      return Materialize.toast('Enter an email, dummy.', 2000);
    }

    if (playerEmail.indexOf('@') < 0) {
      return Materialize.toast('Enter a real email, dummy.', 2000);
    }

    if (!playerPassword) {
      return Materialize.toast('Enter a password, dummy.', 2000);
    }

    const $xhr = $.ajax({
      url: '/session',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email, password})
    });

    $xhr.done(() => {
      if ($xhr.status !== 200) {
        Materialize.toast('SNAFU');

        return;
      }

      Materialize.toast('Good job, mate.');
    });

    $xhr.fail(() => {
      Materialize.toast('The server broke. Our apologies.');
    });
  });
})();

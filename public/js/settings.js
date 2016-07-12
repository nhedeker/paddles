'use strict';

(function() {
  if (!window.COOKIES.loggedIn) {
    window.location.href = '/';

    return;
  }

  const displayUserInformation = function() {
    const $xhrSettings = $.ajax({
      url: '/player',
      type: 'GET',
      dataType: 'json'
    });

    $xhrSettings.done((player) => {
      if ($xhrSettings.status !== 200) {
        return Materialize.toast('SNAFU in retrieving player information.');
      }

      $('#firstName').text(`First Name: ${player.first_name}`);
      $('#lastName').text(`Last Name: ${player.last_name}`);
      $('#email').text(`Email: ${player.email}`);

      $('#updateEmail').off();
      $('#updatePassword').off();
      $('#deleteAccount').off();

      // eslint-disable-next-line no-use-before-define
      updateEmail();

      // eslint-disable-next-line no-use-before-define
      updatePassword();

      // eslint-disable-next-line no-use-before-define
      deleteAccount();
    });

    // eslint-disable-next-line max-len
    $xhrSettings.fail(() => Materialize.toast('The server broke in retrieving user information. Our apologies.'));
  };

  $(document).ready(() => {
    displayUserInformation();
  });

  const updateAccount = function(url, updates) {
    const $xhr = $.ajax({
      url,
      type: 'PATCH',
      contentType: 'application/json',
      data: JSON.stringify(updates)
    });

    $xhr.done(() => {
      if ($xhr.status !== 200) {
        Materialize.toast('SNAFU at updating a player');

        return false;
      }

      let text;

      if (url.includes('email')) {
        text = 'Email was updated successfully!';
        displayUserInformation();
      }
      else if (url.includes('password')) {
        text = 'Password was updated successfully!';
      }

      Materialize.toast(text);
    });

    $xhr.fail((jqXHR, textStatus, _error) => {
      Materialize.toast('Error: ', jqXHR.responseText);

      return false;
    });
  };

  const updateEmail = function() {
    $('#updateEmail').on('click', (_event) => {
      const playerEmail = $('#newEmail').val().trim();

      if (!playerEmail) {
        return Materialize.toast('Enter an email, dummy.', 2000);
      }

      if (playerEmail.indexOf('@') < 0) {
        return Materialize.toast('Enter a real email, dummy.', 2000);
      }

      const update = { playerEmail };

      updateAccount('/player/email', update);
    });
  };

  const updatePassword = function() {
    $('#updatePassword').on('click', (_event) => {
      const playerPassword = $('#newPassword').val().trim();
      const confirmPassword = $('#confirmPassword').val().trim();

      if (!playerPassword) {
        return Materialize.toast('Enter a password, dummy.', 2000);
      }

      if (playerPassword !== confirmPassword) {
        return Materialize.toast('Confirm your password, dummy.', 2000);
      }

      const update = { playerPassword };

      updateAccount('/player/password', update);
    });
  };

  const deleteAccount = function() {
    $('#deleteAccount').on('click', (_event) => {
      const $xhr = $.ajax({
        url: '/player',
        type: 'DELETE'
      });

      $xhr.done(() => {
        if ($xhr.status !== 200) {
          Materialize.toast('SNAFU at deleting a player');

          return;
        }

        window.location.href = '/';
      });

      $xhr.fail(() => {
        // eslint-disable-next-line max-len
        Materialize.toast('The server broke while deleting player account. Our apologies.');
      });
    });
  };
})();

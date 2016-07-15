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
    $xhrSettings.fail((jqXHR, textStatus, _error) => {
      Materialize.toast(`Error: ${jqXHR.responseText}`, 2500);

      return false;
    });
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
      let text;

      if (url.includes('email')) {
        text = 'Email was updated successfully!';
        $('#newEmail').val('');
        $('.emailDiv .valid').removeClass('valid');
        $('.emailDiv .active').removeClass('active');
        displayUserInformation();
      }
      else if (url.includes('password')) {
        $('#newPassword').val('');
        $('#confirmPassword').val('');
        $('.passDiv .valid').removeClass('valid');
        $('.passDiv .active').removeClass('active');
        text = 'Password was updated successfully!';
      }

      Materialize.toast(text, 2500);
    });

    $xhr.fail((jqXHR, textStatus, _error) => {
      Materialize.toast(`Error: ${jqXHR.responseText}`, 2500);

      return false;
    });
  };

  const updateEmail = function() {
    $('#updateEmail').on('click', (_event) => {
      const playerEmail = $('#newEmail').val().trim();

      if (!playerEmail || playerEmail.indexOf('@') < 0) {
        return Materialize.toast('Please enter a valid email address', 2500);
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
        return Materialize.toast('Please enter a new password', 2500);
      }

      if (playerPassword !== confirmPassword) {
        return Materialize.toast('Please confirm your password', 2500);
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
        window.location.href = '/';
      });

      $xhr.fail((jqXHR, textStatus, _error) => {
        Materialize.toast(`Error: ${jqXHR.responseText}`, 2500);

        return false;
      });
    });
  };
})();

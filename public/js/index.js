'use strict';

(function() {
  if (window.COOKIES.loggedIn) {
    window.location.href = '/table.html';

    return;
  }

  // eslint-disable-next-line max-len
  const createPlayer = function({ leagueName, leaguePassword, firstName, lastName, playerEmail, playerPassword }) {
    const $xhr = $.ajax({
      url: '/league/player',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        leagueName,
        leaguePassword,
        firstName,
        lastName,
        playerEmail,
        playerPassword })
    });

    $xhr.done(() => {
      if ($xhr.status !== 200) {
        Materialize.toast('SNAFU at creating a player');

        return;
      }

      Materialize.toast('Your account has been created! Please login.');
    });

    $xhr.fail(() => {
      Materialize.toast('The server broke in player creation. Our apologies.');
    });
  };

  // eslint-disable-next-line max-len
  const createLeague = function({ leagueName, leaguePassword, firstName, lastName, playerEmail, playerPassword }) {
    const $xhrLeague = $.ajax({
      url: '/league',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ leagueName, leaguePassword })
    });

    $xhrLeague.done(() => {
      if ($xhrLeague.status !== 200) {
        return Materialize.toast('SNAFU Creating a League');
      }

      Materialize.toast('New League Created');

      // eslint-disable-next-line max-len
      createPlayer({ leagueName, leaguePassword, firstName, lastName, playerEmail, playerPassword });
    });

    // eslint-disable-next-line max-len
    $xhrLeague.fail(() => Materialize.toast('The server broke in league creation. Our apologies.'));
  };

  $('.login-button').click((_event) => {
    const playerEmail = $('#loginEmail').val().trim();
    const playerPassword = $('#loginPassword').val().trim();

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
      data: JSON.stringify({ playerEmail, playerPassword })
    });

    $xhr.done(() => {
      if ($xhr.status !== 200) {
        Materialize.toast('SNAFU');

        return;
      }

      window.location.href = '/table.html';
    });

    $xhr.fail(() => {
      Materialize.toast('The server broke. Our apologies.');
    });
  });

  // eslint-disable-next-line max-statements
  $('.registration-button').click((_event) => {
    const playerEmail = $('#regEmail').val().trim();
    const playerPassword = $('#regPassword').val().trim();
    const playerConfirmPass = $('#passwordConfirm').val().trim();
    const firstName = $('#firstName').val().trim();
    const lastName = $('#lastName').val().trim();

    const loginLeagueName = $('#loginLeagueName').val().trim();
    const loginLeaguePass = $('#loginLeaguePassword').val().trim();
    const regLeagueName = $('#registerLeagueName').val().trim();
    const regLeaguePass = $('#registerLeaguePassword').val().trim();
    const confirmRegLeaguePass = $('#confirmLeaguePassword').val().trim();

    if (!firstName) {
      return Materialize.toast('Enter a first name, dummy.', 2000);
    }

    if (!lastName) {
      return Materialize.toast('Enter a last name, dummy.', 2000);
    }

    if (!playerEmail) {
      return Materialize.toast('Enter an email, dummy.', 2000);
    }

    if (playerEmail.indexOf('@') < 0) {
      return Materialize.toast('Enter a real email, dummy.', 2000);
    }

    if (!playerPassword) {
      return Materialize.toast('Enter a password, dummy.', 2000);
    }

    if (playerPassword !== playerConfirmPass) {
      return Materialize.toast('Confirm your password, dummy.', 2000);
    }

    // eslint-disable-next-line max-len
    if ((!regLeagueName || !regLeaguePass) && (!loginLeagueName || !loginLeaguePass)) {
      return Materialize.toast('Create or join a team, dummy.', 2000);
    }

    let leagueName;
    let leaguePassword;

    if (loginLeagueName && loginLeaguePass) {
      leagueName = loginLeagueName;
      leaguePassword = loginLeaguePass;

      // eslint-disable-next-line max-len
      createPlayer({ leagueName, leaguePassword, firstName, lastName, playerEmail, playerPassword });

      return;
    }
    else if (regLeaguePass === confirmRegLeaguePass) {
      leagueName = regLeagueName;
      leaguePassword = regLeaguePass;

      // eslint-disable-next-line max-len
      createLeague({ leagueName, leaguePassword, firstName, lastName, playerEmail, playerPassword });
    }
    else {
      return Materialize.toast('Confirm league password, dummy.', 2000);
    }
  });
})();

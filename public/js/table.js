'use strict';

/* eslint-disable max-len */
(function() {
  let initialized = 0;
  let cardSwitch = 0;

  const dropdownBuilder = function(players, target) {
    for (const player of players) {
      const $player = $(`<option value="${player.id}">`);

      $player.text(`${player.first_name} ${player.last_name}`);

      target.append($player);
    }
  };

  const cardBuilder = function() {
    const $xhrRecent = $.getJSON('/league/games');

// eslint-disable-next-line max-statements
    $xhrRecent.done((recentGames) => {
      if ($xhrRecent.status !== 200) {
        Materialize.toast('Something went wrong');

        return;
      }

      const $row = $('<div class="row">');

      for (const game of recentGames) {
        const $cardCol = $('<div class="col s6 m4 l3">');
        const $cardPan = $('<div class="card-panel gameCard">');
        const $table = $('<table class="centered">');
        const $players1Tr = $('<tr>');
        const $scoresTr = $('<tr>');
        const $players2Tr = $('<tr>');

        if (!cardSwitch) {
          $cardPan.addClass('redCard');
          cardSwitch = 1;
        }
        else {
          $cardPan.addClass('goldCard');
          cardSwitch = 0;
        }

        $players1Tr.append($(`<td><p class="gameps">${game.t1p1_first_name}</p><p class="gameps">${game.t1p1_last_name}</p></td>`));
        $players1Tr.append($(`<td><p class="gameps">${game.t2p1_first_name}</p><p class="gameps">${game.t2p1_last_name}</p></td>`))

        $scoresTr.append($(`<td>${game.team1_score}</td>`));
        $scoresTr.append($(`<td>${game.team2_score}</td>`));

        $table.append($players1Tr)

        if (game.t1p2_first_name && game.t2p2_first_name) {
          $players2Tr.append($(`<td class="player2td"><p class="gameps">${game.t1p2_first_name}</p><p class="gameps">${game.t1p2_last_name}</p></td>`));
          $players2Tr.append($(`<td class="player2td"><p class="gameps">${game.t2p2_first_name}</p><p class="gameps">${game.t2p2_last_name}</p></td>`));
          $scoresTr.children().addClass('player2score')
        }
        else {
          $players2Tr.append($('<td>'))
          $scoresTr.children().addClass('player1score')
        }

        $table.append($players2Tr);
        $table.append($scoresTr);

        $cardPan.append($table);
        $cardCol.append($cardPan);
        $row.append($cardCol);
      }

      $('#recentGames').append($row);
    });

    $xhrRecent.fail((jqXHR, textStatus, error) => {
      Materialize.toast('Error: ', error);
    });
  };

  const tableBuilder = function() {
    const $xhrLeaderboard = $.getJSON('/league/players');

// eslint-disable-next-line max-statements
    $xhrLeaderboard.done((playerResults) => {
      if ($xhrLeaderboard.status !== 200) {
        Materialize.toast('Something went wrong');

        return;
      }

      const $table = $('<table class="striped centered">');
      const $thead = $('<thead><th>Rank</th><th>Name</th><th>Elo</th></tr></thead>');
      const $tbody = $('<tbody>');

      for (let i = 0; i < playerResults.length; i++) {
        if (playerResults[i].elo) {
          const name = `${playerResults[i].first_name} ${playerResults[i].last_name}`;
          const elo = playerResults[i].elo;
          const $newRow = $(`<tr><td>${i + 1}</td><td>${name}</td><td>${elo}</td>`);

          $tbody.append($newRow);
        }
      }

      $table.append($thead);
      $table.append($tbody);
      $('#leaderboard').append($table);

      if (!initialized) {
        initialized = 1;

        dropdownBuilder(playerResults, $('.player1'));
        dropdownBuilder(playerResults, $('.player2'));
        dropdownBuilder(playerResults, $('.player3'));
        dropdownBuilder(playerResults, $('.player4'));
        $('select').material_select();
      }
    });

    $xhrLeaderboard.fail((jqXHR, textStatus, error) => {
      Materialize.toast('Error: ', error);
    });
  };

  const dropdownDisabler = function() {
    const valList = {};

    $('.addchoice :selected').each((index, choice) => {
      valList[$(choice).val()] = 1;
    });

    $('option').each((index, option) => {
      $(option).attr('disabled', null);
      if ($(option).val() !== 'null' && valList[$(option).val()]) {
        $(option).prop('disabled', true);
      }
    });

    $('select').material_select();
  };

// eslint-disable-next-line max-statements
  const gameSender = function() {
    const team1P1Id = $('.player1 :selected').val();
    const team1P2Id = $('.player2 :selected').val();
    const team2P1Id = $('.player3 :selected').val();
    const team2P2Id = $('.player4 :selected').val();
    const team1Score = $('.score1').val();
    const team2Score = $('.score2').val();

    if (team1P1Id === 'null' || team2P1Id === 'null') {
      return Materialize.toast('Please enter a player 1 for both teams.', 2000);
    }

    if (team1P2Id === 'null' && team2P2Id !== 'null' || team1P2Id !== 'null' && team2P2Id === 'null') {
      return Materialize.toast('Please enter a player 2 for both teams.', 2000);
    }

    if (!team1Score || !team2Score) {
      return Materialize.toast('Please enter a score for both teams.', 2000);
    }

    if (team1Score === team2Score) {
      return Materialize.toast('No ties!', 2000);
    }

    const $xhrGame = $.ajax({
      url: '/league/game',
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify({
        team1P1Id,
        team1P2Id,
        team2P1Id,
        team2P2Id,
        team1Score,
        team2Score })
    });

    $xhrGame.done(() => {
      if ($xhrGame.status !== 200) {
        return Materialize.toast('Something went wrong.');
      }

      $('#leaderboard').empty();
      $('#recentGames').empty();
      tableBuilder();
      cardBuilder();
      $('#addgamemodal').closeModal();
    });

    $xhrGame.fail((jqXHR, _textStatus, _error) => {
      Materialize.toast('Error: ', jqXHR.responseText);
    });
  };

  const leagueBuilder = function() {
    const $xhrLeague = $.ajax({
      url: '/league',
      contentType: 'application/json',
      type: 'GET'
    });

    $xhrLeague.done((league) => {
      if ($xhrLeague.status !== 200) {
        return Materialize.toast('Something went wrong.');
      }

      if (!league.startsWith('The') && !league.startsWith('the')) {
        league = `THE ${league}`;
      }

      if (!league.endsWith('League') && !league.endsWith('league')) {
        league = `${league} LEAGUE`;
      }

      $('h3').text(league.toUpperCase());
    });

    $xhrLeague.fail((jqXHR, _textStatus, _error) => {
      Materialize.toast('Error: ', jqXHR.responseText);
    });
  };

  $(document).ready(() => {
    leagueBuilder();
    tableBuilder();
    cardBuilder();
    $('.addchoice').change(dropdownDisabler);
    $('.submit').click(gameSender);
  });
})();

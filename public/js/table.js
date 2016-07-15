'use strict';

/* eslint-disable max-len */
(function() {
  let initialized = 0;

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
      const $row = $('<div class="row">');

      if (recentGames.length === 0) {
        return;
      }
      for (let i = 0; i < 6; i++) {
        const $cardCol = $('<div class="col s12 m6 l4">');
        const $cardPan = $('<div class="card-panel gameCard redCard z-depth-1">');
        const $table = $('<table class="centered">');
        const $players1Tr = $('<tr>');
        const $scoresTr = $('<tr>');
        const $players2Tr = $('<tr>');

        const $player1Name = $(`<td class="rightborder"><p class="gameps">${recentGames[i].t1p1_first_name}</p><p class="gameps">${recentGames[i].t1p1_last_name}</p></td>`);
        const $player2Name = $(`<td><p class="gameps">${recentGames[i].t2p1_first_name}</p><p class="gameps">${recentGames[i].t2p1_last_name}</p></td>`);

        const $team1Score = $(`<td class="rightborder">${recentGames[i].team1_score}</td>`);
        const $team2Score = $(`<td>${recentGames[i].team2_score}</td>`);

        if (recentGames[i].team1_score > recentGames[i].team2_score) {
          $team1Score.addClass('winningscore');
        }
        else {
          $team2Score.addClass('winningscore');
        }

        $players1Tr.append($player1Name);
        $players1Tr.append($player2Name);
        $scoresTr.append($team1Score);
        $scoresTr.append($team2Score);

        $table.append($players1Tr);

        if (recentGames[i].t1p2_first_name && recentGames[i].t2p2_first_name) {
          $players2Tr.append($(`<td class="rightborder player2td"><p class="gameps">${recentGames[i].t1p2_first_name}</p><p class="gameps">${recentGames[i].t1p2_last_name}</p></td>`));
          $players2Tr.append($(`<td class="player2td"><p class="gameps">${recentGames[i].t2p2_first_name}</p><p class="gameps">${recentGames[i].t2p2_last_name}</p></td>`));
          $scoresTr.children().addClass('player2score');
          $players1Tr.children().addClass('player2tdtop');
        }
        else {
          $players2Tr.append($('<td class="empty rightborder">'));
          $scoresTr.children().addClass('player1score');
        }

        $table.append($players2Tr);
        $table.append($scoresTr);

        $cardPan.append($table);
        $cardCol.append($cardPan);
        $row.append($cardCol);
        if (i === recentGames.length - 1) {
          break;
        }
      }

      $('#recentGames').append($row);
    });

    $xhrRecent.fail((jqXHR, textStatus, _error) => {
      Materialize.toast(`Error: ${jqXHR.responseText}`, 2500);

      return false;
    });
  };

  const tableBuilder = function() {
    const $xhrLeaderboard = $.getJSON('/league/players');

    // eslint-disable-next-line max-statements
    $xhrLeaderboard.done((playerResults) => {
      const $table = $('<table class="striped centered">');
      const $thead = $('<thead><th>Rank</th><th>Name</th><th>Elo</th></tr></thead>');
      const $tbody = $('<tbody>');
      let rankCount = 1;

      for (let i = 0; i < playerResults.length; i++) {
        if (playerResults[i].elo) {
          const name = `${playerResults[i].first_name} ${playerResults[i].last_name}`;
          const elo = playerResults[i].elo;
          const $newRow = $(`<tr><td>${rankCount}</td><td>${name}</td><td>${elo}</td>`);

          rankCount += 1;
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

    $xhrLeaderboard.fail((jqXHR, textStatus, _error) => {
      Materialize.toast(`Error: ${jqXHR.responseText}`, 2500);

      return false;
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
      return Materialize.toast('Please enter a player 1 for both teams', 2500);
    }

    if (team1P2Id === 'null' && team2P2Id !== 'null' || team1P2Id !== 'null' && team2P2Id === 'null') {
      return Materialize.toast('Please enter a player 2 for both teams', 2500);
    }

    if (!team1Score || !team2Score) {
      return Materialize.toast('Please enter a score for both teams', 2500);
    }

    if (team1Score === team2Score) {
      return Materialize.toast('No ties allowed!', 2500);
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
      Materialize.toast('Game was submitted successfully!', 2500);
      $('#leaderboard').empty();
      $('#recentGames').empty();
      tableBuilder();
      cardBuilder();
      $('#addgamemodal').closeModal();
      $('.addchoice').prop('selectedIndex', 0);
      dropdownDisabler();
      $('.score1').val(null);
      $('.score2').val(null);
      $('#addgamemodal .active').removeClass('active');
    });

    $xhrGame.fail((jqXHR, _textStatus, _error) => {
      Materialize.toast(`Error: ${jqXHR.responseText}`, 2500);
    });
  };

  const leagueBuilder = function() {
    const $xhrLeague = $.ajax({
      url: '/league',
      contentType: 'application/json',
      type: 'GET'
    });

    $xhrLeague.done((league) => {
      if (!league.startsWith('The') && !league.startsWith('the')) {
        league = `THE ${league}`;
      }

      if (!league.endsWith('League') && !league.endsWith('league')) {
        league = `${league} LEAGUE`;
      }

      $('h3').text(league.toUpperCase());
    });

    $xhrLeague.fail((jqXHR, _textStatus, _error) => {
      Materialize.toast(`Error: ${jqXHR.responseText}`, 2500);
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

'use strict';

(function() {
  $('select').material_select();
  const cardBuilder = function(game) {
    const $cardCol = $('<div class="col s6 m4 l3">');
    const $cardPan = $('<div class="card-panel red" style="height:27vh">');
    const $innerRow = $('<div class="white-text row">');
    const $leftCol = $('<div class="col s5" style="text-align:center">');
    const $centerCol =$('<div class="col s2" style="margin-top:5vh; text-align:left">');
    const $rightCol = $('<div class="col s5" style="text-align:center">');
    let modifier = 1;
    if (!game.t1p2_first_name && !game.t2p2_first_name) {
      modifier = 1.2;
    }

    $leftCol.append($(`<p style="font-size:${2 * modifier}vh">${game.t1p1_first_name} ${game.t1p1_last_name}</p>`));
    $rightCol.append($(`<p style="font-size:${2 * modifier}vh">${game.t2p1_first_name} ${game.t2p1_last_name}</p>`))

    if (game.t1p2_first_name && game.t2p2_first_name) {
      $leftCol.append($(`<p style="font-size:2vh">${game.t1p2_first_name} ${game.t1p2_last_name}</p>`));
      $rightCol.append($(`<p style="font-size:2vh">${game.t2p2_first_name} ${game.t2p2_last_name}</p>`));
    }

    $leftCol.append($(`<p style="font-size:${2.5 * modifier}vh">${game.team1_score}</p>`));
    $rightCol.append($(`<p style="font-size:${2.5 * modifier}vh">${game.team2_score}</p>`));
    $centerCol.append($(`<p style="font-size:${2.5 * modifier}vh">VS</p>`));
    $innerRow.append($leftCol).append($centerCol).append($rightCol);
    $cardPan.append($innerRow);
    $cardCol.append($cardPan);

    return $cardCol;
  };

  $(document).ready(() => {
    const $xhrLeaderboard = $.getJSON('/league/players');

    $xhrLeaderboard.done((leaderboard) => {
      if ($xhrLeaderboard.status !== 200) {
        Materialize.toast('Something went wrong');

        return;
      }
      const $table = $('<table>');
      const $thead =  $('<th>Rank</th><th>Name</th><th>Elo</th></tr></thead>');
      const $tbody = $('<tbody>');

      for (let i = 0; i < leaderboard.length; i++) {
        const name = `${leaderboard[i].first_name} ${leaderboard[i].last_name}`;
        const elo = leaderboard[i].elo;
        const $newRow = $(`<tr><td>${i + 1}</td><td>${name}</td><td>${elo}</td>`);
        $tbody.append($newRow);
      }
      $table.append($thead);
      $table.append($tbody);
      $('#leaderboard').append($table);
    });

    $xhrLeaderboard.fail((jqXHR, textStatus, error) => {
      Materialize.toast('Error: ' + error);
    });
  });

  $(document).ready(() => {
    const $xhrRecent = $.getJSON('/league/games');

    $xhrRecent.done((recentGames) => {
      if($xhrRecent.status !== 200) {
        Materialize.toast('Something went wrong');

        return;
      }

      const $row = $('<div class="row">');
      for (let game of recentGames) {
        $row.append(cardBuilder(game));
      };
      $('#recentGames').append($row);
    });

    $xhrRecent.fail((jqXHR, textStatus, error) => {
      Materialize.toast('Error: ' + error);
    })
  });
})();

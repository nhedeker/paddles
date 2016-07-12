'use strict';

(function() {
  $(document).ready(() => {
    const $xhr = $.ajax({
      url: '/league/games',
      type: 'GET'
    })

    $xhr.done((leaderboard) => {
      if ($xhr.status !== 200) {
        Materialize.toast('Something went wrong');

        return;
      }
      console.log(leaderboard.recentGames)
      const $table = $('<table>');
      const $thead =  $('<th>Rank</th><th>Name</th><th>Elo</th></tr></thead>');
      const $tbody = $('<tbody>');

      for (let i = 0; i < leaderboard.rankings.length; i++) {
        const name = `${leaderboard.rankings[i].first_name} ${leaderboard.rankings[i].last_name}`
        const elo = leaderboard.rankings[i].elo
        const $newRow = $(`<tr><td>${i + 1}</td><td>${name}</td><td>${elo}</td>`)
        $tbody.append($newRow);
      }
      $table.append($thead);
      $table.append($tbody);
      $('#leaderboard').append($table);
    });

    $xhr.fail((jqXHR, textStatus, error) => {
      Materialize.toast('Error: ' + error);
    });
  });
})();


function PuzzleGame(node, url, debugMode, callbState) {
    var jigsaws = ['']
    var puzzles,
        puzzlesInOrder = [],
        piecesCount;
    const size = 'big';
    var Puzz = new Puzzler(url, size, jigsaws, function(pieces, countX, countY, size, {getContainer, containers}) {

        size *= 1.4;
        node.innerHTML = '';

        puzzles = pieces;
        for (y = 0; y < countY; y++) {
            puzzlesInOrder[y] = [].concat(puzzles[y]);
        }

        piecesCount = countX*countY;

        var x = 0, y = 0;

        // shuffle
        for (y = 0; y < countY; y++) {
            for (x = 0; x < countX; x++) {
                var random = Math.floor(Math.random() * countX * countY);
                //x = [y, y = x][0]
                var tempX = random % countY;
                var tempY = Math.floor(random / countX);
                var temp = puzzles[tempY][tempX];
                puzzles[tempY][tempX] = puzzles[y][x];
                puzzles[y][x] = temp;
            }
        }
        callbState(puzzles, countY, countX, getContainer, containers);

        x = 0; y = 0;

        for (var j = 0; j < countY; j++) {
            for (var i = 0; i < countX; i++) {

                // var container = pieces[j][i].container;

                // container.setAttribute('data-puzzle-x', i);
                // container.setAttribute('data-puzzle-y', j);

                // node.appendChild(container);

                // container.style.top = y + 'px';
                // container.style.left = x + 'px';

                x += size;
            }

            x = 0;
            y += size;
        }

    }, function(complete, all) {
        node.innerHTML = 'Prepare pieces: ' + complete + '/' + all;
    }, debugMode);
}

PuzzleGame.prototype = function() {

};

export default () => {
  window.PuzzleGame = PuzzleGame;
}

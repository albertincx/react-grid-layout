/**
 * JS object to cut any image for puzzle.
 *
 * v 0.034
 *
 * Copyright (c) 2010 Alexey Androsov <doochik@ya.ru>
 * Licensed under GPLv3
 * http://www.opensource.org/licenses/gpl-3.0.html
 */

/**
 *
 * @param imageSrc
 */
var Puzzler = function(
  imageSrc, type, jigsaws, onComplete, onProgress, debugMode) {
  var image = new Image();
  var self = this;
  self.containers = {};
  var sizes = {
    'small': 40,
    'normal': 60,
    'big': 80,
  };

  if (!(type in sizes)) {
    type = 'normal';
  }

  this.jigsaws = [];

  for (var i = 0, j = jigsaws.length; i < j; i++) {
    var jigsaw = jigsaws[i];
    if (jigsaw in this.knownJigsaws) {
      this.jigsaws.push(this.knownJigsaws[jigsaw]);
    }
  }

  this.jigsawsLength = this.jigsaws.length;

  var pieceWidth = sizes[type];
  var pieceHeight = sizes[type];

  // here we're waiting for image load, so prepare array for pieces
  var pieces = [],
    pieceRelations = [];

  var xCount, yCount;

  image.onload = function() {

    xCount = Math.floor(image.width / pieceWidth);
    yCount = Math.floor(image.height / pieceHeight);

    for (var y = 0; y < yCount; y++) {
      pieces[y] = [];
      pieceRelations[y] = [];
      for (var x = 0; x < xCount; x++) {
        pieces[y][x] = [];
        pieceRelations[y][x] = [];
      }
    }

    x = 0;
    y = 0;
    let itemId = 0;
    self.getContainer = makePiece;
    const CALL_FUN = function() {

      self.containers[`item${itemId}`] = {
        x,
        y,
        w: pieceWidth,
        h: pieceHeight,
      };
      itemId += 1;
      // pieces[y][x] = makePiece(x, y, pieceWidth, pieceHeight);
      x++;
      if (x >= xCount) {
        x = 0;
        y++;
      }

      onProgress(x + (y * xCount), xCount * yCount);

      if (y < yCount) {
        setTimeout(CALL_FUN, 10);
      } else {
        onComplete(pieces, xCount, yCount, pieceHeight, {getContainer: self.getContainer, containers: self.containers});
      }
    };
    window.setTimeout(CALL_FUN, 10);

  };

  image.onerror = function() {
    throw new Error('Can\'t load image');
  };

  image.src = imageSrc;

  function makePiece(x, y, pieceWidth, pieceHeight, ret, ww) {

    var pieceRelation
    if (!ret) {
      pieceRelation = [
        !def(pieceRelations[y][x][0]) ? (pieceRelations[y][x][0] = y === 0
          ? null
          : relation()) : pieceRelations[y][x][0], //top,
        !def(pieceRelations[y][x][1]) ? (pieceRelations[y][x][1] = x === xCount -
        1 ? null : relation()) : pieceRelations[y][x][1], //left
        !def(pieceRelations[y][x][2]) ? (pieceRelations[y][x][2] = y === yCount -
        1 ? null : relation()) : pieceRelations[y][x][2], //bottom
        !def(pieceRelations[y][x][3]) ? (pieceRelations[y][x][3] = x === 0
          ? null
          : relation()) : pieceRelations[y][x][3], //right
      ];
    } else {
      pieceRelation = [
        pieceRelations[y][x][0], //top,
        pieceRelations[y][x][1], //left
        pieceRelations[y][x][2], //bottom
        pieceRelations[y][x][3], //right
      ];
    }
    if (!ret) {
      makeNext(pieceRelations, x + 1, y, 3, pieceRelation[1]);
      makeNext(pieceRelations, x, y + 1, 0, pieceRelation[2]);
    }
    var originalX = pieceWidth * x;
    var originalY = pieceHeight * y;
    var width = pieceWidth;
    var height = pieceHeight;

    var pieceNullX = 0;
    var pieceNullY = 0;

    var canvas = document.createElement('canvas');
    canvas.width = ww || 250;
    // canvas.width = pieceWidth;
    canvas.height = 210;
    // canvas.height = pieceHeight;
    var canvasContext = canvas.getContext('2d');

    let xW = canvas.width;
    let xH = 210;
    // xW = width;
    // xH = height;
    canvasContext.drawImage(
      image,
      originalX, // original x
      originalY, // original y
      width, // original width
      height, // original height
      0, // destination x
      0, // destination y
      xW, // destination width
      xH, // destination height
    );
    // console.log('x', originalX)
    // console.log('y', originalY)
    // console.log('width', width)
    // console.log('height', height)
    // console.log('xW', xW)
    // console.log('xH', xH)
    var container = document.createElement('div');
    container.style.cssText = 'position:absolute;height:' + canvas.height +
      'px;width:' + canvas.width + 'px';
    container.appendChild(canvas);

    canvas.style.cssText = 'position:absolute;top:0;left:0';

    var piece = {};
    piece[self.pieceKey(x, y)] = {
      canvas: canvas,
      width: pieceWidth,
      height: pieceHeight,
      offsetX: pieceNullX,
      offsetY: pieceNullY,
      neighbours: {},
    };
    return {
      pieces: piece,
      container: container,
    }
  }

  function relation() {
    return {
      type: Math.round(Math.random()) === 1 ? 'male' : 'female',
    };
  }

  function makeNext(pieceRelations, x, y, pos, myVal) {
    if (myVal !== null) {
      pieceRelations[y][x][pos] = {
        type: myVal.type === 'male' ? 'female' : 'male',
        jigsaw: myVal.jigsaw,
      };
    }
  }

  function def(arg) {
    return typeof arg !== 'undefined';
  }
};

Puzzler.prototype = {

  drawPoint: function(canvas, x, y) {
    var canvasContext = canvas.getContext('2d');

    canvasContext.beginPath();
    canvasContext.strokeStyle = '#F00';
    canvasContext.moveTo(x - 1, y - 1);
    canvasContext.lineTo(x, y);
    canvasContext.stroke();
    canvasContext.closePath();
  },

  /**
   *
   * @param x
   * @param y
   */
  pieceKey: function(x, y) {
    return y + '-' + x;
  },

  pieceKeyToArray: function(key) {
    return key.split('-');
  },

  /**
   * Merge two pieces into one container.
   * It's simpler than merge two canvas into one.
   * @param container1
   * @param container2
   * @param {String} piece1ConnectingSide
   * @return {Node}
   */
  mergePieces: function(
    container1, piece1Index, piece1ConnectingSide, container2) {
    var side1,
      side2;

    var connectTopAndBottom = piece1ConnectingSide === 'bottom';

    var piece1 = container1.pieces[piece1Index];//TODO: rename piece1Connector
    side1 = piece1.neighbours[piece1ConnectingSide];

    var piece2 = container2.pieces[this.pieceKey(side1.attachToX,
      side1.attachToY)];
    side2 = piece2.neighbours[side1.attachToSide];

    var width1 = piece1.canvas.width,
      width2 = piece2.canvas.width,
      height1 = piece1.canvas.height,
      height2 = piece2.canvas.height;

    var tabSize = side1.attachSize;

    var newWidth, newHeight;

    if (connectTopAndBottom) {
      newWidth = Math.max(side1.offsetX, side2.offsetX) // left offset
        + Math.max(width1 - side1.offsetX, width2 - side2.offsetX); // right offset;;

      newHeight = height1 + height2 - tabSize;

    } else {
      newWidth = width1 + width2 - tabSize;

      newHeight = Math.max(side1.offsetY, side2.offsetY) // top offset
        + Math.max(height1 - side1.offsetY, height2 - side2.offsetY); // bottom offset;

    }

    var newLeft = parseInt(container2.container.style.left, 10) -
      parseInt(container1.container.style.left, 10);
    var newTop = parseInt(container2.container.style.top, 10) -
      parseInt(container1.container.style.top, 10);

    for (var mergePieceIndex in container2.pieces) {
      var mergePiece = container2.pieces[mergePieceIndex];

      mergePiece.canvas.style.top = (parseInt(mergePiece.canvas.style.top, 10) +
        newTop) + 'px';
      mergePiece.canvas.style.left = (parseInt(mergePiece.canvas.style.left,
        10) + newLeft) + 'px';
      container1.container.appendChild(mergePiece.canvas);

      for (var mergePieceNeighbourIndex in mergePiece.neighbours) {
        var mergePieceNeighbour = mergePiece.neighbours[mergePieceNeighbourIndex];
        mergePieceNeighbour.offsetX += newLeft;
        mergePieceNeighbour.offsetY += newTop;
      }

      container1.pieces[mergePieceIndex] = mergePiece;
    }

    container2.container.parentNode.removeChild(container2.container);

//        this._fixDuplicateConnectors(container1, 'right', 'left');
//        this._fixDuplicateConnectors(container1, 'bottom', 'top');
    this._deleteDuplicateConnectorsByIndex(container1);

    return container1;
  },

  _fixDuplicateConnectors: function(container1, checkSide, connectToSide) {
    for (var piece1Index in container1.pieces) {
      var piece1 = container1.pieces[piece1Index],
        piece1Connector = piece1.neighbours[checkSide];

      if (piece1Connector) {
        for (var piece2Index in container1.pieces) {
          var piece2 = container1.pieces[piece2Index],
            piece2Connector = piece2.neighbours[connectToSide];

          if (piece2Connector) {
            if (piece1Connector.offsetX === piece2Connector.offsetX
              && piece1Connector.offsetY === piece2Connector.offsetY) {

              delete piece1.neighbours[checkSide];
              delete piece2.neighbours[connectToSide];
            }
          }
        }
      }
    }
  },

  _oppositeSide: {
    'right': 'left',
    'left': 'right',
    'top': 'bottom',
    'bottom': 'top',
  },

  /**
   * Delete duplicate connectors by its index.
   * Piece[3][4]['left'] delete Piece[3][3]['right'].
   * @param container
   */
  _deleteDuplicateConnectorsByIndex: function(container) {
    var pieces = container.pieces;

    for (var piece1Index in pieces) {
      var piece1 = pieces[piece1Index],
        piece1Neighbours = piece1.neighbours;

      for (var connectionSide in piece1Neighbours) {
        var connectorParams = piece1Neighbours[connectionSide];
        var connectorSide = this._oppositeSide[connectionSide];
        var neighbour = pieces[this.pieceKey(connectorParams.attachToX,
          connectorParams.attachToY)];
        if (neighbour && neighbour.neighbours &&
          neighbour.neighbours[connectorSide]) {
          delete neighbour.neighbours[connectorSide];
          delete piece1Neighbours[connectionSide];
        }
      }

      /*if (piece1Connector) {
          for (var piece2Index in container.pieces) {
              var piece2 = container.pieces[piece2Index],
                  piece2Connector = piece2.neighbours[connectToSide];

              if (piece2Connector) {
                  if (piece1Connector.offsetX === piece2Connector.offsetX
                      && piece1Connector.offsetY === piece2Connector.offsetY) {

                      delete piece1.neighbours[checkSide];
                      delete piece2.neighbours[connectToSide];
                  }
              }
          }
      }*/
    }
  },

  getRandomJigsaw: function() {
    return this.jigsaws[this.getRandomInt(0, this.jigsawsLength - 1)];
  },

  /**
   * Returns a random integer between min and max
   * @see https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Math/random
   * @param {Number} min
   * @param {Number} max
   * @return {Number}
   */
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  knownJigsaws: {},
};

/**
 * Register jigsaw in Puzzler
 * @param {Object} jigsaw
 * @static
 */
Puzzler.registerJigsaw = function(jigsaw) {
  if (jigsaw.name in Puzzler.prototype.knownJigsaws) {
    throw new Error('Jigsaw with such name is already exists.');
  }

  Puzzler.prototype.knownJigsaws[jigsaw.name] = jigsaw;
};

/**
 * Extends target jigsaw with abstract Puzzler.aJigsaw;
 * @static
 * @param {Object} jigsaw
 * @return {Object}
 */
Puzzler.makeJigsaw = function(jigsaw) {
  var aJigsaw = Puzzler.aJigsaw;
  for (var prop in aJigsaw) {
    // extend properties that doesn't exist in target jigsaw
    if (aJigsaw.hasOwnProperty(prop) && !jigsaw.hasOwnProperty(prop)) {
      jigsaw[prop] = aJigsaw[prop];
    }
  }

  return jigsaw;
};
/**
 * @name Puzzle.aJigsaw
 * @class Abstract class for jigsaw
 */
Puzzler.aJigsaw = {

  /**
   * Jigsaw name.
   * @type String
   * @private
   */
  name: '',

  /**
   * Jigsaw size
   * @type Number
   * @private
   */
  _size: 0.2,

  /**
   * @param {CanvasContext} context
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Boolean} [female=false]
   */
  _makeTransparent: function(context, x1, y1, x2, y2, female) {
    var i, j;

    for (i = x1; i < x2; i++) {
      for (j = y1; j < y2; j++) {
        // bitwise XOR
        // inPath ^ true === 0
        // !inPath ^ false === 0
        if ((context.isPointInPath(i, j) ^ female) === 0) {
          context.clearRect(i, j, 1, 1);
        }
      }
    }
  },

  /**
   * @constant
   * @type Number
   */
  _radInDeg: Math.PI / 180,

  /**
   * Convert degrees to radians.
   * @param {Number} deg
   * @return {Number}
   */
  _degToRad: function(deg) {
    return deg * this._radInDeg;
  },

  /**
   * Return tab size.
   * @param {Number} size Size of side.
   * @param {Boolean} male Male or female.
   * @return {Number}
   */
  getSize: function(size, male) {
    return male ? Math.round(size * this._size) : 0;
  },
};

(function() {

  var jigsaw = {
    name: 'rectangle',

    _relationSide: function(type, x1, y1, x2, y2) {
      return {
        type: type,
        offsetX: Math.round((x2 - x1) / 2 + x1),
        offsetY: Math.round((y2 - y1) / 2 + y1),
      };
    },

    _makeFemale: function(canvas, x1, y1, x2, y2) {
      var context = canvas.getContext('2d');
      context.clearRect(x1, y1, x2 - x1, y2 - y1);
    },

    /**
     * Make male for top and bottom side.
     * @param {HTMLCanvasElement} canvas
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     */
    _makeMaleTopAndBottom: function(canvas, x1, y1, x2, y2) {
      var context = canvas.getContext('2d');

      context.clearRect(0, y1, x1, y2 - y1);
      context.clearRect(x2, y1, canvas.width - x2, y2 - y1);
    },

    /**
     * Make male for left and right side.
     * @param {HTMLCanvasElement} canvas
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     */
    _makeMaleLeftAndRight: function(canvas, x1, y1, x2, y2) {
      var context = canvas.getContext('2d');
      context.clearRect(x1, 0, x2 - x1, y1);
      context.clearRect(x1, y2, x2 - x1, canvas.height - y2);
    },

    male_0: function(canvas, width, height, x, y) {
      var rw = width / 3,
        x1 = Math.round(rw + x),
        y1 = 0,
        x2 = Math.round(rw * 2 + x),
        y2 = Math.round(y);

      this._makeMaleTopAndBottom(canvas, x1, y1, x2, y2);
      return this._relationSide('male', x1, y1, x2, y2);
    },

    male_1: function(canvas, width, height, x, y) {
      var rh = height / 3,
        x1 = Math.round(width + x),
        y1 = Math.round(rh + y),
        x2 = Math.round(canvas.width),
        y2 = Math.round(rh * 2 + y);

      this._makeMaleLeftAndRight(canvas, x1, y1, x2, y2);
      return this._relationSide('male', x1, y1, x2, y2);
    },

    male_2: function(canvas, width, height, x, y) {
      var rw = width / 3,
        x1 = Math.round(rw + x),
        y1 = Math.round(height + y),
        x2 = Math.round(rw * 2 + x),
        y2 = Math.round(canvas.height);

      this._makeMaleTopAndBottom(canvas, x1, y1, x2, y2);
      return this._relationSide('male', x1, y1, x2, y2);
    },

    male_3: function(canvas, width, height, x, y) {
      var rh = height / 3,
        x1 = 0,
        y1 = Math.round(rh + y),
        x2 = Math.round(width * this._size),
        y2 = Math.round(rh * 2 + y);

      this._makeMaleLeftAndRight(canvas, x1, y1, x2, y2);
      return this._relationSide('male', x1, y1, x2, y2);
    },

    female_0: function(canvas, width, height, x, y) {
      var rw = width / 3,
        x1 = Math.round(rw + x),
        y1 = Math.round(0 + y),
        x2 = Math.round(rw * 2 + x),
        y2 = Math.round(height * this._size + y);

      this._makeFemale(canvas, x1, y1, x2, y2);
      return this._relationSide('female', x1, y1, x2, y2);
    },

    female_1: function(canvas, width, height, x, y) {
      var rh = height / 3,
        x1 = Math.round(width * (1 - this._size) + x),
        y1 = Math.round(rh + y),
        x2 = Math.round(width + x),
        y2 = Math.round(rh * 2 + y);

      this._makeFemale(canvas, x1, y1, x2, y2);
      return this._relationSide('female', x1, y1, x2, y2);
    },

    female_2: function(canvas, width, height, x, y) {
      var rw = width / 3,
        x1 = Math.round(rw + x),
        y1 = Math.round(height * (1 - this._size) + y),
        x2 = Math.round(rw * 2 + x),
        y2 = Math.round(height + y);

      this._makeFemale(canvas, x1, y1, x2, y2);
      return this._relationSide('female', x1, y1, x2, y2);
    },

    female_3: function(canvas, width, height, x, y) {
      var rh = height / 3,
        x1 = Math.round(0 + x),
        y1 = Math.round(rh + y),
        x2 = Math.round(width * this._size + x),
        y2 = Math.round(rh * 2 + y);

      this._makeFemale(canvas, x1, y1, x2, y2);
      return this._relationSide('female', x1, y1, x2, y2);
    },
  };

  Puzzler.registerJigsaw(Puzzler.makeJigsaw(jigsaw));
})();

(function() {

  var jigsaw = {
    name: 'arc',

    male_0: function(canvas, width, height, x, y) {
      var x1 = Math.round(width / 2 + x);

      var size = this.getSize(height, true);

      var context = canvas.getContext('2d');
      context.beginPath();
      context.strokeStyle = 'transparent';
      context.arc(x1, y, size, 0, this._degToRad(180), true);
      context.stroke();
      context.closePath();

      this._makeTransparent(context, 0, 0, canvas.width, y, false);

      return {
        type: 'male',
        offsetX: x1,
        offsetY: Math.round(size / 2),
      };
    },

    male_1: function(canvas, width, height, x, y) {
      var x1 = width + x;
      var y1 = Math.round(height / 2 + y);

      var size = this.getSize(width, true);

      var context = canvas.getContext('2d');
      context.beginPath();
      context.strokeStyle = 'transparent';
      context.arc(x1, y1, size, this._degToRad(90), this._degToRad(270), true);
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1, 0, canvas.width, canvas.height, false);

      return {
        type: 'male',
        offsetX: x1 + Math.round(size / 2),
        offsetY: y1,
      };
    },

    male_2: function(canvas, width, height, x, y) {
      var x1 = Math.round(width / 2 + x);
      var y1 = height + y;

      var size = this.getSize(height, true);

      var context = canvas.getContext('2d');
      context.beginPath();
      context.strokeStyle = 'transparent';
      context.arc(x1, y1, size, this._degToRad(180), this._degToRad(360), true);
      context.stroke();
      context.closePath();

      this._makeTransparent(context, 0, y1, canvas.width, canvas.height, false);

      return {
        type: 'male',
        offsetX: x1,
        offsetY: y1 + Math.round(size / 2),
      };
    },

    male_3: function(canvas, width, height, x, y) {
      var x1 = x;
      var y1 = Math.round(height / 2 + y);

      var size = this.getSize(width, true);

      var context = canvas.getContext('2d');
      context.beginPath();
      context.strokeStyle = 'transparent';
      context.arc(x1, y1, size, this._degToRad(-90), this._degToRad(90), true);
      context.stroke();
      context.closePath();

      this._makeTransparent(context, 0, 0, x1, canvas.height, false);

      return {
        type: 'male',
        offsetX: x1 - Math.round(size / 2),
        offsetY: y1,
      };
    },

    female_0: function(canvas, width, height, x, y) {
      var x1 = Math.round(width / 2 + x);
      var y1 = 0;

      var size = this.getSize(height, true);

      var context = canvas.getContext('2d');
      context.beginPath();
      context.strokeStyle = 'transparent';
      context.arc(x1, y1, size, this._degToRad(180), this._degToRad(360), true);
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1 - size, y1, x1 + size, size, true);

      return {
        type: 'female',
        offsetX: x1,
        offsetY: Math.round(size / 2),
      };
    },

    female_1: function(canvas, width, height, x, y) {
      var x1 = canvas.width;
      var y1 = Math.round(height / 2 + y);

      var size = this.getSize(width, true);

      var context = canvas.getContext('2d');
      context.beginPath();
      context.strokeStyle = 'transparent';
      context.arc(x1, y1, size, this._degToRad(-90), this._degToRad(90), true);
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1 - size, y1 - size, x1, y1 + size, true);

      return {
        type: 'female',
        offsetX: x1 - Math.round(size / 2),
        offsetY: y1,
      };
    },

    female_2: function(canvas, width, height, x, y) {
      var x1 = Math.round(width / 2 + x);
      var y1 = canvas.height;

      var size = this.getSize(height, true);

      var context = canvas.getContext('2d');
      context.beginPath();
      context.strokeStyle = 'transparent';
      context.arc(x1, y1, size, this._degToRad(0), this._degToRad(180), true);
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1 - size, y1 - size, x1 + size, y1, true);

      return {
        type: 'female',
        offsetX: x1,
        offsetY: y1 - Math.round(size / 2),
      };
    },

    female_3: function(canvas, width, height, x, y) {
      var x1 = 0;
      var y1 = Math.round(height / 2 + y);

      var size = this.getSize(width, true);

      var context = canvas.getContext('2d');
      context.beginPath();
      context.strokeStyle = 'transparent';
      context.arc(x1, y1, size, this._degToRad(-90), this._degToRad(90), false);
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1, 0, x1 + size, canvas.height, true);

      return {
        type: 'female',
        offsetX: Math.round(size / 2),
        offsetY: y1,
      };
    },
  };

  Puzzler.registerJigsaw(Puzzler.makeJigsaw(jigsaw));

})();

(function() {

  var jigsaw = {
    name: 'classic',

    beziers: [
      [0, 192, 0, 0, 0, 0],
      [0, 0, 448, -224, 448, -96],
      [448, -32, 384, -32, 384, 64],
      [384, 160, 448, 192, 512, 192],
      [576, 192, 640, 160, 640, 64],
      [640, -32, 576, -32, 576, -96],
      [576, -224, 1024, 0, 1024, 0],
      [1024, 0, 1024, 192, 1024, 192],
      [1024, 192, 0, 192, 0, 192],
    ],

    tabSize: 192,
    waveSize: 136,

    _rotatePoint: function(x, y, degrees) {
      return [
        Math.round(x * Math.cos(Math.PI / 180 * degrees) - y *
          Math.sin(Math.PI / 180 * degrees)),
        Math.round(x * Math.sin(Math.PI / 180 * degrees) + y *
          Math.cos(Math.PI / 180 * degrees)),
      ];
    },

    /**
     * Поворот фигуры на указанное количество градусов
     * @param degrees
     */
    _rotate: function(degrees) {
      return this.beziers.map(function(curve) {
        return [].concat(this._rotatePoint(curve[0], curve[1], degrees)).concat(
          this._rotatePoint(curve[2], curve[3], degrees)).concat(
          this._rotatePoint(curve[4], curve[5], degrees));
      }, this);
    },

    _relationSide: function(type, x1, y1, x2, y2) {
      return {
        type: type,
        offsetX: Math.round((x2 - x1) / 2 + x1),
        offsetY: Math.round((y2 - y1) / 2 + y1),
      };
    },

    male_0: function(canvas, width, height, x, y) {
      var x1 = Math.round(x),
        y1 = 0,
        x2 = Math.round(width + x),
        y2 = y;

      var context = canvas.getContext('2d');

      var xProp = width / 1024;
      var yProp = y / this.tabSize;

      context.beginPath();
      context.strokeStyle = 'transparent';
      this._rotate(180).forEach(function(b, i) {
        if (i === 0) {
          context.moveTo(b[0] * xProp + width + x, b[1] * yProp + y2);
        }
        context.bezierCurveTo(
          b[0] * xProp + width + x, b[1] * yProp + y2,
          b[2] * xProp + width + x, b[3] * yProp + y2,
          b[4] * xProp + width + x, b[5] * yProp + y2,
        );
      });
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1, y1, x2,
        y2 + this.getFemaleSize(height), true);

      return this._relationSide('male', x1, y1, x2,
        y2 + this.getFemaleSize(height));
    },

    male_1: function(canvas, width, height, x, y) {
      var x1 = Math.round(width + x),
        y1 = Math.round(y),
        x2 = Math.round(canvas.width),
        y2 = Math.round(height + y);

      var context = canvas.getContext('2d');

      var xProp = (x2 - x1) / this.tabSize;
      var yProp = height / 1024;

      context.beginPath();
      context.strokeStyle = 'transparent';
      this._rotate(270).forEach(function(b, i) {
        if (i === 0) {
          context.moveTo(b[0] * xProp + x1, b[1] * yProp + y2);
        }
        context.bezierCurveTo(b[0] * xProp + x1, b[1] * yProp + y2,
          b[2] * xProp + x1, b[3] * yProp + y2,
          b[4] * xProp + x1, b[5] * yProp + y2);
      });
      context.stroke();
      context.closePath();

      context.clearRect(x1, 0, x2, y);
      context.clearRect(x1, y + height, x2, canvas.height);

      this._makeTransparent(context, x1 - this.getFemaleSize(width), y1, x2, y2,
        true);

      return this._relationSide('male', x1, y1, x2, y2);
    },

    male_2: function(canvas, width, height, x, y) {
      var x1 = Math.round(x),
        y1 = Math.round(height + y),
        x2 = Math.round(x + width),
        y2 = Math.round(canvas.height);

      var context = canvas.getContext('2d');

      var xProp = width / 1024;
      var yProp = this.getMaleSize(height) / this.tabSize;

      context.beginPath();
      context.strokeStyle = 'transparent';
      this.beziers.forEach(function(b, i) {
        if (i === 0) {
          context.moveTo(b[0] * xProp + x1, b[1] * yProp + y1);
        }
        context.bezierCurveTo(b[0] * xProp + x1, b[1] * yProp + y1,
          b[2] * xProp + x1, b[3] * yProp + y1,
          b[4] * xProp + x1, b[5] * yProp + y1);
      });
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1, y1 - Math.round(this.waveSize * yProp),
        x2, y2, true);

      return this._relationSide('male', x1, y1, x2, y2);
    },

    male_3: function(canvas, width, height, x, y) {
      var x1 = 0,
        y1 = Math.round(y),
        x2 = Math.round(x),
        y2 = Math.round(y + height);

      var context = canvas.getContext('2d');

      var xProp = (x2 - x1) / this.tabSize;
      var yProp = height / 1024;

      context.beginPath();
      context.strokeStyle = 'transparent';
      this._rotate(90).forEach(function(b, i) {
        if (i === 0) {
          context.moveTo(b[0] * xProp + x2, b[1] * yProp + y1);
        }
        context.bezierCurveTo(b[0] * xProp + x2, b[1] * yProp + y1,
          b[2] * xProp + x2, b[3] * yProp + y1,
          b[4] * xProp + x2, b[5] * yProp + y1);
      });
      context.stroke();
      context.closePath();

      context.clearRect(x1, 0, x2, y1);
      context.clearRect(x1, y2, x2, canvas.height);

      this._makeTransparent(context, x1, y1, x2 + this.getFemaleSize(width), y2,
        true);

      return this._relationSide('male', x1, y1, x2 + this.getFemaleSize(width),
        y2);
    },

    female_0: function(canvas, width, height, x, y) {
      var x1 = Math.round(x),
        y1 = Math.round(y),
        x2 = Math.round(width + x),
        y2 = Math.round(this.getMaleSize(height) + y);

      var context = canvas.getContext('2d');

      var xProp = width / 1024;
      var yProp = this.getMaleSize(height) / this.tabSize;

      context.beginPath();
      context.strokeStyle = 'transparent';
      this.beziers.forEach(function(b, i) {
        if (i === 0) {
          context.moveTo(b[0] * xProp + x, b[1] * yProp + y1);
        }
        context.bezierCurveTo(b[0] * xProp + x, b[1] * yProp + y1,
          b[2] * xProp + x, b[3] * yProp + y1,
          b[4] * xProp + x, b[5] * yProp + y1);
      });
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1, 0, x2, y2);

      return this._relationSide('female', x1, y1, x2, y2);
    },

    female_1: function(canvas, width, height, x, y) {
      var x1 = Math.round(width + x),
        y1 = Math.round(y),
        x2 = Math.round(canvas.width),
        y2 = Math.round(y + height);

      var context = canvas.getContext('2d');

      var xProp = (x2 - x1) / this.waveSize;
      var yProp = height / 1024;

      context.beginPath();
      context.strokeStyle = 'transparent';
      this._rotate(90).forEach(function(b, i) {
        if (i === 0) {
          context.moveTo(b[0] * xProp + x1, b[1] * yProp + y1);
        }
        context.bezierCurveTo(b[0] * xProp + x1, b[1] * yProp + y1,
          b[2] * xProp + x1, b[3] * yProp + y1,
          b[4] * xProp + x1, b[5] * yProp + y1);
      });
      context.stroke();
      context.closePath();

      context.clearRect(x1, 0, x2, y);
      context.clearRect(x1, y + height, x2, canvas.height);

      this._makeTransparent(context, x1 - this.getMaleSize(width) + 1 /*strange blank line*/,
        y1, x2, y2);

      return this._relationSide('female', x1 - this.getMaleSize(width), y1, x2,
        y2);
    },

    female_2: function(canvas, width, height, x, y) {
      var x1 = Math.round(x),
        y1 = Math.round(height + y),
        x2 = Math.round(width + x),
        y2 = Math.round(canvas.height);

      var context = canvas.getContext('2d');

      var xProp = width / 1024;
      var yProp = this.getMaleSize(height) / this.tabSize;

      context.beginPath();
      context.strokeStyle = 'transparent';
      this._rotate(180).forEach(function(b, i) {
        if (i === 0) {
          context.moveTo(b[0] * xProp + width + x, b[1] * yProp + y1);
        }
        context.bezierCurveTo(
          b[0] * xProp + width + x, b[1] * yProp + y1,
          b[2] * xProp + width + x, b[3] * yProp + y1,
          b[4] * xProp + width + x, b[5] * yProp + y1,
        );
      });
      context.stroke();
      context.closePath();

      this._makeTransparent(context, x1, y1 - this.getMaleSize(height), x2, y2);

      return this._relationSide('female', x1, y1 - this.getMaleSize(height), x2,
        y2);
    },

    female_3: function(canvas, width, height, x, y) {
      var x1 = Math.round(x),
        y1 = Math.round(y),
        x2 = Math.round(this.getMaleSize(width) + x),
        y2 = Math.round(height + y);

      var context = canvas.getContext('2d');

      var xProp = (x2 - x1) / this.tabSize;
      var yProp = height / 1024;

      context.beginPath();
      context.strokeStyle = 'transparent';
      this._rotate(270).forEach(function(b, i) {
        if (i === 0) {
          context.moveTo(b[0] * xProp + x1, b[1] * yProp + y2);
        }
        context.bezierCurveTo(b[0] * xProp + x1, b[1] * yProp + y2,
          b[2] * xProp + x1, b[3] * yProp + y2,
          b[4] * xProp + x1, b[5] * yProp + y2);
      });
      context.stroke();
      context.closePath();

      context.clearRect(0, 0, x1, y);
      context.clearRect(0, y + height, x1, canvas.height);

      this._makeTransparent(context, 0, y1, x2, y2);

      return this._relationSide('female', x1, y1, x2, y2);
    },

    getSize: function(size, male) {
      return this['get' + (male ? 'M' : 'Fem') + 'aleSize'](size);
    },

    getMaleSize: function(size) {
      return Math.ceil(size * this._size);
    },

    getFemaleSize: function(size) {
      // get proportion and calc size for wave
      return Math.ceil(this.getMaleSize(size) / this.tabSize * this.waveSize);
    },
  };

  Puzzler.registerJigsaw(Puzzler.makeJigsaw(jigsaw));
})();
/**
 * Check for canvas support
 * @static
 * @memberOf Puzzler
 * @name Puzzler.support
 * @return {Boolean}
 */
Puzzler.support = function() {
  var canvas = document.createElement('canvas');
  return canvas && canvas.getContext;
};
export default () => {
  window.Puzzler = Puzzler;
}

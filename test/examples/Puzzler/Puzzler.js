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
    'big': 90,
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
  // console.log(pieceWidth, pieceHeight);
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
        onComplete(pieces, xCount, yCount, pieceHeight,
          { getContainer: self.getContainer, containers: self.containers });
      }
    };
    window.setTimeout(CALL_FUN, 10);

  };

  image.onerror = function() {
    throw new Error('Can\'t load image');
  };

  image.src = imageSrc;

  function makePiece(x, y, pieceWidth, pieceHeight, ret, ww, BN) {

    var pieceRelation;
    if (!ret) {
      pieceRelation = [
        !def(pieceRelations[y][x][0]) ? (pieceRelations[y][x][0] = y === 0
          ? null
          : relation()) : pieceRelations[y][x][0], //top,
        !def(pieceRelations[y][x][1]) ? (pieceRelations[y][x][1] = x ===
        xCount -
        1 ? null : relation()) : pieceRelations[y][x][1], //left
        !def(pieceRelations[y][x][2]) ? (pieceRelations[y][x][2] = y ===
        yCount -
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
    canvas.height = window.getHeight(true);
    // canvas.height = pieceHeight;
    var canvasContext = canvas.getContext('2d');

    let xW = canvas.width;
    let xH = canvas.height;
    // console.log(xH, xW)
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
    container.setAttribute('id', BN)
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
    };
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

  /**
   *
   * @param x
   * @param y
   */
  pieceKey: function(x, y) {
    return y + '-' + x;
  },

  _oppositeSide: {
    'right': 'left',
    'left': 'right',
    'top': 'bottom',
    'bottom': 'top',
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
  };

  Puzzler.registerJigsaw(Puzzler.makeJigsaw(jigsaw));
})();

(function() {

  var jigsaw = {
    name: 'arc',
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

    getSize: function(size, male) {
      return this['get' + (male ? 'M' : 'Fem') + 'aleSize'](size);
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

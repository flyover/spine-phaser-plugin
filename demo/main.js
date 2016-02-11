function main() {
  function preload(game) {
    //console.log("preload", arguments);
    game.load.image('logo', '/phaser/phaser-logo-small.png');
    game.load.json('raptor.json', '/spine.js/demo/examples/raptor/export/raptor.json');
    game.load.text('raptor.atlas', '/spine.js/demo/examples/raptor/export/raptor.atlas');
    game.load.image('raptor.png', '/spine.js/demo/examples/raptor/export/raptor.png');
  }
  function create(game) {
    //console.log("create", arguments);
    var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);
    var raptor = game.add.spine({ json: 'raptor.json', atlas: 'raptor.atlas', image: 'raptor.png', data: 'raptor', skin: 'default', anim: 'walk' });
    raptor.scale.setTo(0.25, 0.25);
  }
  function update(game) {
    //console.log("update", arguments);
  }
  function render(game) {
    //console.log("render", arguments);
  }
  var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
}

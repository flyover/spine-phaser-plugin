Phaser.Plugin.Spine = function(game, parent) {
  Phaser.Plugin.call(this, game, parent);
};
Phaser.Plugin.Spine.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Spine.prototype.constructor = Phaser.Plugin.Spine;
Phaser.Plugin.Spine.VERSION = "0.0.0";

Phaser.Plugin.Spine.SpineObject = function(game, options) {
  Phaser.Group.call(this, game);
  options = options || {};
  var json_key = options.json || '';
  var atlas_key = options.atlas || '';
  var image_key = options.image || '';
  var data_key = options.data || '';
  var skin_key = options.skin || 'default';
  var anim_key = options.anim || '';
  this.json = game.cache.getJSON(json_key);
  this.atlas = game.cache.getText(atlas_key);
  this.images = {};
  this.images[image_key] = game.cache.getImage(image_key);
  this.spine_data = new spine.Data().load(this.json);
  this.atlas_data = new atlas.Data().importAtlasText(this.atlas);
  this.spine_pose = new spine.Pose(this.spine_data);
  this.spine_pose.setSkin(skin_key);
  this.spine_pose.setAnim(anim_key);
  if (game.renderer instanceof PIXI.WebGLRenderer) {
    //console.log("WebGL");
    var gl = game.renderer.gl;
    this.render_webgl = new RenderWebGL(gl);
    this.render_webgl.loadData(this.spine_data, this.atlas_data, this.images);
  } else if (game.renderer instanceof PIXI.CanvasRenderer) {
    //console.log("Canvas");
    var ctx = game.renderer.context;
    this.render_ctx2d = new RenderCtx2D(ctx);
    this.render_ctx2d.loadData(this.spine_data, this.atlas_data, this.images);
  } else {
    console.log("TODO");
  }
};
Phaser.Plugin.Spine.SpineObject.prototype = Object.create(Phaser.Group.prototype);
Phaser.Plugin.Spine.SpineObject.prototype.constructor = Phaser.Plugin.Spine.SpineObject;
Phaser.Plugin.Spine.SpineObject.prototype.destroy = function(game) {
  console.log("destroy", arguments);
  game = game || this.game;
  if (game.renderer instanceof PIXI.WebGLRenderer) {
    this.render_webgl.dropData(this.spine_data, this.atlas_data);
    delete this.render_webgl;
  } else if (game.renderer instanceof PIXI.CanvasRenderer) {
    this.render_ctx2d.dropData(this.spine_data, this.atlas_data);
    delete this.render_ctx2d;
  } else {
    console.log("TODO");
  }
  delete this.json;
  delete this.atlas;
  delete this.images;
  delete this.spine_data;
  delete this.spine_pose;
  Phaser.Group.prototype.destroy.call(this, game);
}
Phaser.Plugin.Spine.SpineObject.prototype.update = function() {
  Phaser.Group.prototype.update.call(this);
  var dt = this.game.time.physicsElapsedMS;
  this.spine_pose.update(dt);
}
Phaser.Plugin.Spine.SpineObject.prototype._renderWebGL = function(renderSession) {
  //console.log("_renderWebGL", arguments);
  var gl /*: WenGLRenderingContext*/ = renderSession.gl;
  this.spine_pose.strike();
  var gl_projection = this.render_webgl.gl_projection;
  var px = renderSession.renderer.projection.x;
  var py = renderSession.renderer.projection.y;
  mat4x4Ortho(gl_projection, -px, px, -py, py, -1, 1);
  mat4x4Translate(gl_projection, this.worldPosition.x, this.worldPosition.y, 0.0);
  mat4x4RotateZ(gl_projection, this.worldRotation);
  mat4x4Scale(gl_projection, this.worldScale.x, this.worldScale.y, 1.0);
  mat4x4Scale(gl_projection, 1.0, -1.0, 1.0); // x: right, y: up
  var gl_color = this.render_webgl.gl_color;
  gl_color[3] = this.worldAlpha;
  this.render_webgl.drawPose(this.spine_pose, this.atlas_data);
};
Phaser.Plugin.Spine.SpineObject.prototype._renderCanvas = function(renderSession) {
  //console.log("_renderCanvas", arguments);
  var ctx /*: CanvasRenderingContext2D*/ = renderSession.context;
  this.spine_pose.strike();
  ctx.save();
  ctx.translate(this.worldPosition.x, this.worldPosition.y);
  ctx.rotate(this.worldRotation);
  ctx.scale(this.worldScale.x, this.worldScale.y);
  ctx.scale(1.0, -1.0); // x: right, y: up
  ctx.globalAlpha = this.worldAlpha;
  this.render_ctx2d.drawPose(this.spine_pose, this.atlas_data);
  ctx.restore();
};

Phaser.GameObjectCreator.prototype.spine = function(options) {
  return new Phaser.Plugin.Spine.SpineObject(this.game, options);
};

Phaser.GameObjectFactory.prototype.spine = function(options) {
  return this.world.add(new Phaser.Plugin.Spine.SpineObject(this.game, options));
};

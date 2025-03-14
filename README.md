# War Battles Tutorial

<a href="https://discord.gg/eukcq5m"><img alt="Chat with us!" src="https://img.shields.io/discord/766898804896038942.svg?colorB=7581dc&logo=discord&logoColor=white"></a>

This tutorial goes through the steps needed to create a small playable game embryo in Defold. You do not need to have any prior experience with Defold, but if you have done some programming in TypeScript, Javascript, Lua, Python or similar, that will help.

You start with a complete project except the exercises below. You can verify that the project is working by [building and running it](defold://build) (or selecting <kbd>Project ▸ Build</kbd> from the menu). This will launch the game and you should see a complete working game that you are going to create.

Delete the `src/scripts` folder if you would like to re-implement this tutorials code. If you would like to re-implement creating the assets, delete the `app` folder and degit (or clone) the original [war-battles tutorial](https://github.com/defold/tutorial-war-battles) as app.

```sh
npx degit defold/tutorial-war-battles.git app
#or
git clone https://github.com/defold/tutorial-war-battles.git app
```

Before continuing be sure to run `npm install`, open the folder in `code .`, and start your dev server with `npm run dev`.

## Draw the game map

Your game needs a setting, a map. The map that you are going to draw will be made out of tiles, small images that are put together like a mosaic into a larger image. In Defold, such an image is called a _Tile map_. In order to create a tile map, you need an image file that contains the various tiles. You then need to specify the size of the tiles, margins and padding and what image file to use in a file of a type called _Tile source_.

1. <kbd>Right click</kbd> the folder "main" and select <kbd>New ▸ Tile source</kbd>. This will create a new tile source file. Name the file "map" (full name "map.tilesource").

   ![map](app/doc/map_tilesource.jpg)

2. The new tilesource file opens automatically in the editor. Set the _Image_ property of the tile source to the image file "/assets/map.png". The easiest way to do that is to click the resource selector by the _Image_ property to bring up the resource selector. Then select the file "/assets/map.png":

   ![tilesource](app/doc/tilesource.jpg)

   The tiles are 16⨉16 pixels in the source image with no margins or padding so there is no need to alter the default properties of the tile source.

3. <kbd>Right click</kbd> the folder "main" and select <kbd>New ▸ Tile map</kbd>. Name the file "map" (full name "map.tilemap"). The tile map is automatically opened in the editor view.

4. Set the _Tile source_ property of the new tile map to "/main/map.tilesource".

5. Select "layer1" in the _Outline_.

6. Select <kbd>Edit ▸ Select Tile...</kbd>. This brings up the tile palette.

   ![palette](app/doc/palette.jpg)

7. Click on a grass tile. This selects the clicked tile as the current brush. Then paint the tile map layer as you see fit with the grass tile. Select other tiles from the tile palette to paint different graphics.

8. You can hold <kbd>Shift</kbd>, then <kbd>click and drag</kbd> to make a selection on the current tile map layer. The selection then becomes your new brush. This is a useful way to paint with a brush consisting of multiple tiles.

   ![selection](app/doc/selection.jpg)

When you are happy with the map, it is time to add it to the game.

## Add the map to the game

Defold stores everything you build in _collections_. A collection is a file used to build hierarchies of game objects and other collections. In the file "game.project" you specify a particular collection that is loaded when the game starts up. This is initially set to the file "/main/main.collection".

1. Open the file ["main.collection"](defold://open?path=/main/main.collection).

2. <kbd>Right click</kbd> the root node of the collection in the _Outline_ and select <kbd>Add game object</kbd>.

   ![add game object](app/doc/add_game_object.jpg)

3. Change the _Id_ property of the game object to "map". The id does not really matter for this game object but it is a good habit to set identifiers that are descriptive---it makes it easier to find your way around when you have many game objects.

4. <kbd>Right click</kbd> the new game object and select <kbd>Add Component File</kbd>.

   ![add component](app/doc/add_component.jpg)

5. In the resource selector, pick the file "/main/map.tilemap". This creates a new component in the game object based on the tilemap file. The tile map should now appear in the editor view.

   ![tilemap](app/doc/tilemap.jpg)

6. Run the game by selecting <kbd>Project ▸ Build</kbd> and check that everything looks good. If you feel that the window is a bit large you can open "game.project" in the project root and alter the display width and height:

   ![display](app/doc/display.jpg)

NOTE: If you get an "Out of tiles to render" error when running the game it means that the tilemap you created was larger than the maximum configured number of tiles. You can solve this by increasing the [Tilemap->Max Tile Count](https://defold.com/manuals/project-settings/#max-tile-count) value in the _game.project_ file.

## Create the player animation

1. <kbd>Right click</kbd> the folder "main" in the _Assets_ view and select <kbd>New ▸ Atlas</kbd>. Name the new atlas file "sprites" (full name "sprites.atlas"). An atlas is a collection of images (PNG or JPEG) that are baked into a larger texture. Defold uses atlases instead of single image files for performance and memory reasons. The new atlas should open in the editor.

2. <kbd>Right click</kbd> the root node of the atlas in the _Outline_ and select <kbd>Add Animation Group</kbd>.

3. Select the new animation group and change its _Id_ property to "player-down".

4. <kbd>Right click</kbd> the "player-down" animation group and select <kbd>Add Images...</kbd>. In the resource selector, pick the images "/assets/infantry/down/1.png" to "/assets/infantry/down/4.png". You can type "down" in the text box to filter the selection of images.

   ![add images](app/doc/add_images.png)

5. With the animation group marked, select <kbd>View ▸ Play</kbd> from the menu to preview the animation. Press <kbd>F</kbd> to frame the animation in the editor if necessary. The animation will play back at full 60 FPS which is way too fast. Set the playback speed (_Fps_ property) to 8.

   ![play animation](app/doc/play_animation.jpg)

Now you have an atlas with a single flipbook animation for the player. This is enough for initial testing---you can add more animations later. Now, let's create the player game object.

## Create the player game object

A Defold game object is an object with an id, a position, a rotation and a scale that holds components. They are used to create things like a player character, a bullet, a game's rule system or a level loader/unloader. A component, in turn, is an entity that gives a game object visual, audible and/or logic representation in the game.

1. Open "main.collection".

2. <kbd>Right click</kbd> the root node of the collection in the _Outline_ and select <kbd>Add Game Object</kbd>. Set the _Id_ property of the new game object to "player".

3. Change the Z _Position_ property of the game object named "player" to 1.0. Since the "map" game object is at the default Z position 0 the "player" game object must be at a higher value (between -1.0 and 1.0) for it to be on top of the level.

4. <kbd>Right click</kbd> the game object "player" and select <kbd>Add Component ▸ Sprite</kbd>. This creates a new sprite component, that can show graphics, in the "player" game object.

5. Make sure that the Z _Position_ of the _Sprite_ is 0 so it will be rendered at the same depth as the game object "player". Setting the Z to a different value will offset the sprite depth from 1.0, which is the Z position of the game object.

6. Set the _Image_ property of the sprite to "/main/sprites.atlas".

7. Set the _Default Animation_ property of the sprite to "player-down".

   ![player sprite](app/doc/player_sprite.jpg)

8. Run the game and check that the player character is animating.

The player game object now has visual representation in the game world. The next step is to add a script component to the player game object. This will allow you to create player behavior, such as movement. But that depends on user input, so first you need to set that up.

## Add input bindings

There are no input mapped by default so you need to add input actions for your player character:

1. Open the file "/input/game.input_binding". This file contains mappings from input sources (keyboard, touch screen, game pads etc) to input _actions_. Actions are just names that we want to associate with certain input.

2. Add _Key triggers_ for the four arrow keys. Name the actions "up", "down", "left" and "right".

   ![input](app/doc/input_bindings.jpg)

## Create the player script

Unlike the sprite component, which you added directly into the "player" game object, a script component requires that you create a separate file. This script file is then used a template for the script component:

1. <kbd>Right click</kbd> the folder "main" in the _Assets_ view and select <kbd>New ▸ Script</kbd>. Name the new script file "player" (full name "player.script"). The script file, pre-filled with template functions, opens up in the editor.

   ![player script](app/doc/player_script.jpg)

2. Open "main.collection", <kbd>Right click</kbd> the game object "player" and select <kbd>Add Component File</kbd>. Pick the new file "/main/player.script" as the file to use for the component.

You now have a script that runs in the "player" game object. It does not do anything yet though. Start by creating the logic for player movement.

## Program the player movement

The Lua code needed to create character movement in 8 directions is not long, but may require some time to understand completely. Replace the code for each of the functions in "player.script" with the code below, run the game, then take your time to carefully read through the code notes below.

```ts
interface action {
  pressed: boolean
}

interface props {
  moving: boolean
  input: vmath.vector3
  dir: vmath.vector3
  speed: number
}

export function init(this: props): void {
  // [1]
  msg.post('.', 'acquire_input_focus') // [2]

  this.moving = false // [3]
  this.input = vmath.vector3() // [4]
  this.dir = vmath.vector3(0, 1, 0) // [5]
  this.speed = 50 // [6]
}

export function final(this: props): void {
  // [7]
  msg.post('.', 'release_input_focus') // [8]
}

export function update(this: props, dt: number): void {
  // [9]
  if (this.moving) {
    let pos = go.get_position() // [10]
    pos = (pos + this.dir * this.speed * dt) as vmath.vector3 // [11]
    go.set_position(pos) // [12]
  }

  this.input.x = 0 // [13]
  this.input.y = 0
  this.moving = false
}

export function on_input(this: props, actionId: hash, action: action): void {
  // [14]
  if (actionId == hash('up')) {
    this.input.y = 1 // [15]
  } else if (actionId == hash('down')) {
    this.input.y = -1
  } else if (actionId == hash('left')) {
    this.input.x = -1
  } else if (actionId == hash('right')) {
    this.input.x = 1
  }

  if (vmath.length(this.input) > 0) {
    this.moving = true // [16]
    this.dir = vmath.normalize(this.input) // [17]
  }
}
```

1. The `init()` function is called when the script component is brought to life in the game engine. This function is useful for initial setup of the game object state.
2. This line posts a message named "acquire_input_focus" to the current game object ("." is shorthand for the current game object). This is a system message that tells the engine to send input actions to this game object. The actions will arrive in this script component's `on_input()` function.
3. `this` is a reference to the current component instance. You can store state data that is local to the component instance in `this`. You use it like a Lua table by indexing the table field variables with the dot notation. The flag variable `moving` is used to track if the player is moving or not.
4. `input` is a vector3, a vector with 3 components: `x`, `y` and `z`, that will point in any of the current 8 input directions. It will change as the player presses the arrow keys. The Z component of this vector is unused so it is kept at value 0.
5. `dir` is another vector3 that contains the direction the player faces. The direction vector is separate from the input vector because if there is no input and the player character does not move, it should still face a direction.
6. `speed` is the movement speed expressed in pixels per second.
7. The `final()` function is called when the script component is deleted from the game. This happens either when the container game object ("player") is deleted or when the game shuts down.
8. The script explicitly releases input focus, telling the engine that it wants no more input. Input focus is automatically released when the game object is deleted so this line is not necessary but is included here for clarity.
9. The `update()` function is called once each frame. The game is running at 60 frames per second so the function is called at an interval of 1/60 seconds. The argument variable `dt` contains the current frame interval---the number of seconds elapsed since the last call to the function.
10. If the `moving` flag is true, get the current game object position. The function `go.get_position()` takes an optional argument which is the id of the game object to get the position of. If no argument is given, the current game object's position is returned.
11. Add the current direction vector (scaled to speed and frame interval) to the position.
12. Set the position of the game object to the new position.
13. After the calculations have been made, set the input vector to 0 and unset the `moving` flag.
14. The `on_input()` function is called every frame for all mapped input that is active. The argument `actionId` contain the action as set up in the input bindings file. The argument `action` is a Lua table with details on the input.
15. For each input direction, set the X or the Y component of the `input` vector in `this`. If the user presses the <kbd>up arrow</kbd> and <kbd>left arrow</kbd> keys simultaneously, the engine will call this function twice and the input vector will end up being set to `(-1, 1, 0)`.
16. If the user presses any of the arrow keys, the input vector length will be non zero. If so, set the `moving` flag so the player will be moved in `update()`. The reason the script does not move the player in the `on_input()` function is that it is simpler to collect all input each frame and then act upon it in `update()`.
17. The `dir` direction vector is set to the normalized value of the input. If the input vector is `(1, 1, 0)`, for instance, the vector length is greater than 1 (the square root of 2). Normalizing the vector brings it to a length of exactly 1. Without normalization diagonal movement would be faster than horizontal and vertical. When the engine runs the `update()` function, any user input will have an effect on the `dir` vector which will cause the player to move.

With the code above, your game now has a player character that can move around on the screen. Next, let's add the possibility to fire rockets.

## Create a rocket game object

Rockets should work like this: whenever the user presses a key, a rocket should fire. It should be possible to fire any number of rockets. To solve that you cannot just add a rocket game object to "main.collection"---that would be only one single rocket object. Instead, what you need to is a _blueprint_ for a rocket game object and then a _factory_ that creates new game objects on the fly based on that blueprint.

Start by creating the game object blueprint file:

1. <kbd>Right click</kbd> the folder "main" in the _Assets_ view and select <kbd>New ▸ Game Object</kbd>. Name this file "rocket" (full name "rocket.go").

2. Open "sprites.atlas" and create a new animation group (right click the root node and select <kbd>Add Animation Group</kbd>). Name the animation "rocket".

3. Add the three rocket images (in "/assets/buildings/turret-rocket") to the animation group and set the _Fps_ property to a value that makes the animation look good when you preview.

   ![rocket animation](app/doc/rocket_animation.jpg)

4. Open "rocket.go" and <kbd>Right click</kbd> the root in the _Outline_ and select <kbd>Add Component ▸ Sprite</kbd>.

5. Set the _Image_ property of the sprite to "/main/sprites.atlas" and the _Default Animation_ to "rocket".

Now you have a basic rocket game object blueprint, on file. The next step is to add functionality to spawn game objects based on this blueprint file. For that, you will use a _Factory_ component. You also need to add a new input action for the firing mechanic.

## Spawn rockets

1. Open "main.collection" and <kbd>Right click</kbd> on the "player" game object. Select <kbd>Add Component ▸ Factory</kbd>.

2. Select the new factory component and set its _Id_ property to "rocketfactory" and its _Prototype_ to the file "/main/rocket.go" (the one you created above). Now the player game object is all set.

3. Open the file "/input/game.input_binding".

4. Add a _Key trigger_ for the firing action. Call this action "fire".

   ![input](app/doc/input_bindings_fire.jpg)

5. Open "main/player.script" and add a flag to track if the player is firing to the `init()` function:

   ```ts
   export function init(this: props): void {
     msg.post('.', 'acquire_input_focus')

     this.moving = false
     this.firing = false // [1]

     this.input = vmath.vector3()
     this.dir = vmath.vector3(0, 1, 0)
     this.speed = 50
   }
   ```

   1. Whenever the player is firing this value will be set to `true`.

6. In `update()`, add what should happen when the flag is set: the factory component should create a new game object instance:

   ```ts
   export function update(this: props, dt: number): void {
     if (this.moving) {
       let pos = go.get_position()
       pos = (pos + this.dir * this.speed * dt) as vmath.vector3
       go.set_position(pos)
     }

     if (this.firing) {
       factory.create('#rocketfactory') // [1]
     }

     this.input.x = 0
     this.input.y = 0

     this.moving = false
     this.firing = false // [2]
   }
   ```

   1. If the `firing` flag is true, tell the factory component called "rocketfactory" that you just created to spawn a new game object. Note the character '#' that indicates that what follows is the id of a component.
   2. Set the firing flag to false. This flag will be set in `on_input()` each frame the player presses the fire key.

7. Scroll down to the `on_input()` function. Add a fifth `elseif` for the case where the function is called with the "fire" action and only the one frame when the key is pressed down:

   ```ts
       ...
       if (actionId == hash("right")) {
           this.input.x = 1;
       else if (actionId == hash("fire") && action.pressed) {
           this.firing = true;
       }
       ...
   ```

If you run the game now you should be able to move around and drop rockets all over the map by hammering the fire key. This is a good start.

## Set the direction of the rocket

When a rocket is spawned, it is currently not oriented in the player's direction. That needs to be fixed. It should also fly straight ahead and explode after a short interval:

1. Open "player.script" and scroll down to the `update()` function and update its code:

   ```ts
   export function update(this: props, dt: number): void {
       if (this.moving) {
           let pos = go.get_position();
           pos = pos + this.dir * this.speed * dt as vmath.vector3;
           go.set_position(pos);
       }

       if (this.firing) {
           const angle = math.atan2(this.dir.y, this.dir.x);           // [1]
           const rot = vmath.quat_rotation_z(angle);                   // [2]
           const props = { dir: this.dir };                            // [3]
           factory.create("#rocketfactory", undefined, rot, props);    // [4]
       }
       ...
   ```

   1. Compute the angle (in radians) of the player.
   2. Create a quaternion for that angular rotation around Z.
   3. Create a table containing property values to pass to the rocket. The player's direction is the only data the rocket needs.
   4. Add explicit position (`nil`, the rocket will spawn at the player's position), rotation (the calculated quaternion) and spawn property values.

   Note that the rocket needs a movement direction in addition to the game object rotation (`rot`). It would be possible to make the rocket calculate its movement vector based on its rotation, but it is easier and more flexible to separate the two values. For instance, with a separate rotation it is possible to add rotation wobble to the rocket without it affecting the movement direction.

2. <kbd>Right click</kbd> the folder "main" in the _Assets_ view and select <kbd>New ▸ Script</kbd>. Name the new script file "rocket" (full name "rocket.script"). Replace the template code in the file with the following:

   ```ts
   go.property('dir', vmath.vector3()) // [1]

   export function init(this: props): void {
     this.speed = 200 // [2]
   }

   export function update(this: props, dt: number): void {
     let pos = go.get_position() // [3]
     pos = (pos + this.dir * this.speed * dt) as vmath.vector3 // [4]
     go.set_position(pos) // [5]
   }
   ```

   1. Define a new script property named `dir` and initialize the property with a default empty vector (`vmath.vector3()`). The default value can be overrided by passing values to the `factory.create()` function. The current property value is accessed as `this.dir`. This is expected to be a unit vector (of length 1).
   2. A rocket speed value, expressed in pixels per second.
   3. Get the current rocket position.
   4. Calculate a new position based on the old position, the movement direction and the speed.
   5. Set the new position.

3. Open "rocket.go" and <kbd>Right click</kbd> the root in the _Outline_ and select <kbd>Add Component File</kbd>. Select the file "rocket.script" as basis for the component.

4. Run the game and try the new mechanic. Notice that the rockets fly in the right direction but they are oriented 180 degrees wrong. That's an easy fix.

   ![fire rockets](app/doc/fire_rockets.jpg)

5. Open "sprites.atlas", select the "rocket" animation and click the _Flip horizontal_ property.

   ![flip rocket](app/doc/flip_rocket.jpg)

6. Run the game again to verify that everything looks ok.

   ![fire rockets](app/doc/fire_rocket_2.jpg)

## Make the rockets explode

The rockets should explode a short while after they are fired:

1. Open "sprites.atlas" and create a new animation group (right click the root node and select <kbd>Add Animation Group</kbd>). Call the animation "explosion".

2. Add the nine explosion images in "/assets/fx/explosion" to the animation group and set the _Fps_ property to a value that makes the animation look good when you preview. Also make sure that this animation has the _Playback_ property set to `Once Forward`.

   ![explosion animation](app/doc/explosion_animation.jpg)

3. Open "rocket.script" and scroll down to the `init()` function and change it to:

   ```ts
   export function init(this: props): void {
     this.speed = 200
     this.life = 1 // [1]
   }
   ```

   1. This value will act as a timer to track the lifetime of the rocket.

4. Scroll down to the `update()` function and change it to:

   ```ts
   export function update(this: props, dt: number): void {
     let pos = go.get_position()
     pos = (pos + this.dir * this.speed * dt) as vmath.vector3
     go.set_position(pos)

     this.life = this.life - dt // [1]
     if (this.life < 0) {
       // [2]
       this.life = 1000 // [3]
       go.set_rotation(vmath.quat()) // [4]
       this.speed = 0 // [5]
       msg.post('#sprite', 'play_animation', { id: hash('explosion') }) // [6]
     }
   }
   ```

   1. Decrease the life timer with delta time. It will decrease with 1.0 per second.
   2. When the life timer has reached zero.
   3. Set the life timer to a large value so this code won't run every subsequent update.
   4. Set the game object rotation to 0, otherwise the explosion graphics will be rotated.
   5. Set the movement speed to 0, otherwise the explosion graphics will move.
   6. Play the "explosion" animation on the game object's "sprite" component.

5. Below the `update()` function, add a new `on_message()` function:

   ```ts
   export function on_message(this: props, messageId: hash, message: {other_id: hash}, _sender: url): void {      // [1]
       if (messageId == hash("animation_done") {               // [2]
           go.delete();                                        // [3]
       }
   }
   ```

   1. The function `on_message()` gets called whenever a message is posted to this script component.
   2. Check if the message posted has the hashed name (or id) "animation_done". The engine runtime sends this message whenever a sprite animation initiated with "play_animation" from this script has completed.
   3. When the animation is done, delete the current game object.

Run the game.

![fire rockets](app/doc/fire_rocket_3.jpg)

This is definitely getting somewhere! Now you just need something to fire the rockets at!

## Create a tank game object

1. <kbd>Right click</kbd> the folder "main" in the _Assets_ view and select <kbd>New ▸ Game Object</kbd>. Name this file "tank" (full name "tank.go"). Like the rocket game object, this is a file that can be used as a _blueprint_ when creating actual tank game objects.

2. Open "sprites.atlas" and create a new animation group (right click the root node and select <kbd>Add Animation Group</kbd>). Name the animation "tank-down".

3. Add the two downwards facing images in "/assets/units/tank/down" to the animation and set it's _Fps_ value to something that looks good.

   ![tank animation](app/doc/tank_animation.jpg)

4. Open "tank.go" and <kbd>Right click</kbd> the root in the _Outline_ and select <kbd>Add Component ▸ Sprite</kbd>.

5. Set the _Image_ property of the sprite to "/main/sprites.atlas" and the _Default animation_ to "tank-down".

6. Open "main.collection".

7. <kbd>Right click</kbd> the root node of the collection in the _Outline_ and select <kbd>Add Game Object File</kbd>. Select "tank.go" as blueprint for the new game object.

8. Create a few more tanks from the blueprint. Position them on the map with the _Move Tool_. Make sure to set the Z position to 1.0 so they are all rendered on top of the map.

   ![tanks](app/doc/tanks.jpg)

Run the game and check that the tanks look okay.

## Add collision objects

When you fire at the tanks, the rockets currently fly straight through them. The next step is to add collision between the tanks and the rockets:

1. Open "tank.go" and <kbd>Right click</kbd> the root in the _Outline_ and select <kbd>Add Component ▸ Collision Object</kbd>.

2. Set the _Type_ property to "Kinematic". This means that the physics engine will not simulate any gravity or collision on this object. Instead it will only detect and signal collisions and leave it to you to code the response.

3. Set the _Group_ property to "tanks" and _Mask_ to "rockets". This causes this game object to detect collisions against object in the group "rockets" that has the mask set to "tanks".

4. <kbd>Right click</kbd> the "collisionobject" component in the _Outline_ and select <kbd>Add Shape ▸ Box</kbd>. Set the size of the box shape to match the tank graphics.

   ![tank collision](app/doc/tank_collision.jpg)

5. Open "rocket.go" and <kbd>Right click</kbd> the root in the _Outline_ and select <kbd>Add Component ▸ Collision Object</kbd>.

6. Set the _Type_ property to "Kinematic".

7. Set the _Group_ property to "rockets" and _Mask_ to "tanks". This causes this game object to detect collisions against object in the group "tanks" that has the mask set to "rockets".

   Now the group and mask between rockets and tanks match each other so the physics engine will detect when they interact.

8. Right click the "collisionobject" component in the Outline and select Add Shape ▸ Box. Set the size of the box shape to match the rocket graphics.

   ![rocket collision](app/doc/rocket_collision.jpg)

The physics engine sends messages to game objects that collide. The last piece of the puzzle is to add code that reacts to those messages.

## Code a reaction to the collisions

1. Open "rocket.script" and scroll down to the `update()` function. There are a couple of things to do here:

   ```ts
   function explode(this: props) {                                    // [1]
       this.life = 1000;
       go.set_rotation(vmath.quat());
       this.speed = 0;
       msg.post("#sprite", "play_animation", { id = hash("explosion") });
   }

   export function update(this: props, dt: number): void {
       let pos = go.get_position();
       pos = pos + this.dir * this.speed * dt as vmath.vector3;
       go.set_position(pos);

       this.life = this.life - dt;
       if (this.life < 0) {
           explode(this);                                           // [2]
       }
   }

   export function on_message(this: props, messageId: hash, message: {other_id: hash}, _sender: url): void {
       if (messageId == hash("animation_done")) {
           go.delete();
       }
       else if (messageId == hash("collision_response") {           // [3]
           explode(this: props);                                    // [4]
           go.delete(message.other_id);                             // [5]
       }
   }
   ```

   1. Since you want the rocket to explode either when the timer runs out (in `update()`) or when the rocket hits a tank (in `on_message()`) you should break out that piece of code to avoid duplication. In this case that is done with a local function. The function is declared `local`, meaning that it only exist within the scope of the rocket script. Lua's scoping rules says that local functions need to be declared before they are used. Therefore the function is placed above `update()`. Also make sure to pass `this` as a parameter to the function so you can access `this.life` etc.
   2. The code that used to live here has been moved to the `explode()` function.
   3. The engine sends a message called "collision_response" when the shapes collide, if the group and mask pairing is correct.
   4. Call the `explode()` function if there is a collision.
   5. Finally delete the tank. You get the id of the game object the rocket collided with through the `message.other_id` variable.

Run the game and destroy some tanks! The tanks aren't very interesting enemies, but they should nevertheless give you some score.

## Create the scoring GUI

1. <kbd>Right click</kbd> the folder "main" in the _Assets_ view and select <kbd>New ▸ Font</kbd>. Name this file "text" (full name "text.font").

2. Open "text.font" and set the _Font_ property to the file "/assets/fonts/04font.ttf".

   ![text font](app/doc/text_font.jpg)

3. <kbd>Right click</kbd> the folder "main" in the _Assets_ view and select <kbd>New ▸ Gui</kbd>. Name this file "ui" (full name "ui.gui"). It will contain the user interface where you will place the score counter.

4. Open "ui.gui". <kbd>Right click</kbd> _Fonts_ in the _Outline_ view and select <kbd>Add ▸ Fonts</kbd>. Select the "/main/text.font" file.

5. <kbd>Right click</kbd> _Nodes_ in the _Outline_ view and select <kbd>Add ▸ Text</kbd>.

6. Select the new text node in the outline and set its _Id_ property to "score", its _Text_ property to "SCORE: 0", its _Font_ property to the font "text" and its _Pivot_ property to "West".

7. Place the text node in the top left corner of the screen.

   ![ui gui](app/doc/ui.jpg)

8. <kbd>Right click</kbd> the folder "main" in the _Assets_ view and select <kbd>New ▸ Gui Script</kbd>. Name this new file "ui" (full name "ui.gui_script").

9. Go back to "ui.gui" and select the root node in the _Outline_. Set the _Script_ property to the file "/main/ui.gui_script" that you just created. Now if we add this Gui as a component to a game object the Gui will be displayed and the script will run.

10. Open "main.collection".

11. <kbd>Right click</kbd> the root node of the collection in the _Outline_ and select <kbd>Add Game Object</kbd>.

12. Set the _Id_ property of the game object to "gui", then <kbd>Right click</kbd> it and select <kbd>Add Component File</kbd>. Select the file "/main/ui.gui". The new component will automatically get the _Id_ "ui".

    ![main gui](app/doc/main_ui.jpg)

Now the score counter is displayed. You only need to add functionality in the Gui script so the score can be updated.

## Code the scoring update

1. Open "ui.gui_script".

2. Replace the template code with the following:

   ```ts
   export function init(this: props) {
       this.score = 0;                                         // [1]
   }

   export function on_message(this: props, messageId: hash, message: {other_id: hash}, _sender: url): void {
       if (message_id == hash("add_score") {                   // [2]
           this.score = this.score + message.score;            // [3]
           const scoreNode = gui.get_node("score");            // [4]
           gui.set_text(scoreNode, "SCORE: " .. this.score);   // [5]
       }
   }
   ```

   1. Store the current score in `this`. Start from 0.
   2. Reaction to a message named "add_score".
   3. Increase the current score value in `this` with the value passed in the message.
   4. Get hold of the text node named "score" that you created in the Gui.
   5. Update the text of the node to the string "SCORE: " and the current score value concatenated to the end of the string.

3. Open "rocket.script" and scroll down to the `on_message()` function where you need to add one new line of code:

   ```ts
   export function on_message(this: props, messageId: hash, message: {other_id: hash}, _sender: url): void {
       if (messageId == hash("animation_done")) {
           go.delete();
       }
       else if (messageId == hash("collision_response") {
           explode(this);
           go.delete(message.other_id);
           msg.post("/gui#ui", "add_score", {score: 100});    // [1]
       }
   }
   ```

   1. Post a message named "add_score" to the component "ui" in the game object named "gui" at the root of the main collection. Pass along a table where the field `score` has been set to 100.

4. Try the game!

![done](app/doc/done.png)

There you go! Well done!

## What next?

We hope you enjoyed this tutorial and that it was helpful. To get to know Defold better, we suggest that you to continue working with this little game. Here are a few suggested exercises:

1. Add directional animations for the player character. Tip, add a function called `update_animation(this)` to the `update()` function and change the animation depending on the value of the `this.dir` vector. It is also worth remembering that if you send a "play_animation" message each frame to a sprite, the animation will restart from the beginning, each frame---so you should only send "play_animation" when the animation should change.

2. Add an "idle" state to the player character so it only plays a walking animation when moving.

3. Make the tanks spawn dynamically. Look at how the rockets are spawned and do a similar setup for the tanks. You might want to create a new game object in the main collection with a script that controls the tank spawning.

4. Make the tanks patrol the map. One simple option is to have the tank pick a random point on the map and move towards that point. When it is within a short distance of the point, it picks a new point.

5. Make the tanks chase the player. One option is to add a new collision object to the tank with a spherical shape. If the player collides with the collision object, have the tank drive towards the player.

6. Make the tanks fire at the player.

7. Add sound effects.

Check out the [documentation pages](https://defold.com/learn) for examples, tutorials, manuals and API docs.

If you run into trouble, help is available in [the Defold forum](https://forum.defold.com) or [the @ts-defold Discord channel](https://discord.gg/eukcq5m)

Happy Defolding!

---

<p align="center" class="h4">
  TypeScript :heart: Defold
</p>

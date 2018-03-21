var canvas = document.getElementById("game_field");
var ctx = canvas.getContext('2d');

var state = {
  'pos_x': 10,
  'pos_y': 200,
  't_pos_x': 400,
  't_pos_y': 50,
  'f_pos_x': 0,
  'f_pos_y': 0,
  'radius': 5,
  'v_x': 1,
  'v_y': 1,
  'a_x': 0,
  'a_y': 0,
  'field_width': 600,
  'field_height': 600
}

pos_x = 10;
pos_y = 10;
v_x = 1;
v_y = 1;
a_x = 0.1;
a_y = 0.1;
field_width = canvas.width;
field_height = canvas.height;
radius = 5;
game_length = 600;
game_time = 6000;
current_game_tick = 0;
state_history = {};

game_started = false;
start_time = 0;
previous_tick_time = 0;
tick_length = 25; // in milliseconds
previous_tick = 0;
paused = false;
pause_start_at = 0;
total_paused = 0;


function simulate_tick(start_time, previous_tick){
  return previous_tick + 1;
}

function current_tick(start_time, previous_tick){
  if(paused){
    return previous_tick;
  }else{
    var current_time = (new Date()).getTime();
    var duration = current_time - start_time - total_paused;
    var num_ticks = parseInt(duration / tick_length);
    var drift = duration % tick_length;
    if(drift <= tick_length * 0.2){
      return num_ticks;
    }else{
      return previous_tick;
    }
  }
}

function gen_tick_time(){
  if(!game_started){
    game_started = true;
    previous_tick_time = (new Date()).getTime();
    return 1;
  }else{
    var current_time = (new Date()).getTime();
    var duration = current_time - previous_tick_time;
    var num_ticks = parseInt(duration / tick_length);
    var drift = (current_time - previous_tick_time) % tick_length;
    if(drift <= tick_length * 0.2){
      previous_tick_time = current_time;
      return num_ticks;
    }else{
      return num_ticks > 0 ? num_ticks - 1 : 0;
    }
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("keypress", keyPressHandler, false);

var moves = {
  "ArrowDown": false,
  "ArrowUp": false,
  "ArrowLeft": false,
  "ArrowRight": false
}

function keyPressHandler(e){
  if(e.code == "Space"){
    if(paused){
      paused = false;
      var state_copy = root_clone(state);
      state_history[current_game_tick] = state;
      for(var i = current_game_tick ; i < game_length ; i ++){
        state_copy = physics_engine_step(state_copy, undefined);
        state_history[i] = state_copy;
      }
    }else{
      paused = true;
    }
  }
}

function keyDownHandler(e){
  if(e.code in moves){
    moves[e.code] = true;
  }
  //if(paused){
    switch(e.code){
      case "ArrowUp":
        state['a_y'] -= 0.01;
        break;
      case "ArrowDown":
        state['a_y'] += 0.01;
        break;
      case "ArrowLeft":
        state['a_x'] -= 0.01;
        break;
      case "ArrowRight":
        state['a_x'] += 0.01;
        break;
    }
    //switch(e.code){
      //case "ArrowUp":
        //state['v_y'] -= 0.1;
        //break;
      //case "ArrowDown":
        //state['v_y'] += 0.1;
        //break;
      //case "ArrowLeft":
        //state['v_x'] -= 0.1;
        //break;
      //case "ArrowRight":
        //state['v_x'] += 0.1;
        //break;
    //}
      var state_copy = root_clone(state);
      state_history[current_game_tick] = state;
      for(var i = current_game_tick ; i < game_length ; i ++){
        state_copy = physics_engine_step(state_copy, undefined);
        state_history[i] = state_copy;
      }
  //}
}

function keyUpHandler(e){
  if(e.code in moves){
    moves[e.code] = false;
  }
}

function drawCircle(){
  ctx.beginPath();
  ctx.arc(pos_x, pos_y, radius, 0, 2*Math.PI);
  ctx.fill();
  ctx.closePath();
}

function predict(){
  //var future_pos_x = 

}

function run_physics(){
  var current_tick_num = current_tick(start_time, previous_tick);
  var num_of_ticks =  current_tick_num - previous_tick;
  if(num_of_ticks > 0){
    previous_tick = current_tick_num
  }
  //console.log(num_of_ticks);
  //console.log(current_tick_num);
  //console.log(previous_tick);

  if(moves["ArrowUp"]){
    v_y -= a_y;
  }
  if(moves["ArrowDown"]){
    v_y += a_y;
  }
  if(moves["ArrowLeft"]){
    v_x -= a_x;
  }
  if(moves["ArrowRight"]){
    v_x += a_x;
  }
  pos_x += v_x * num_of_ticks;
  pos_y += v_y * num_of_ticks;
}

function renderer(state){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.arc(state['pos_x'], state['pos_y'], state['radius'], 0, 2*Math.PI);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.setLineDash([2]);
  ctx.arc(state['f_pos_x'], state['f_pos_y'], state['radius'], 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'red';
  ctx.arc(state['t_pos_x'], state['t_pos_y'], state['radius'] + 5, 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();
}

function mainLoop(){
  if(!game_started){
    game_started = true;
    var state_copy = root_clone(state);
    state_history[0] = state;
    for(var i = 1 ; i < game_length ; i ++){
      state_copy = physics_engine_step(state_copy, undefined);
      state_history[i] = state_copy;
    }
  }
  if(!paused){
    if(current_game_tick < game_length){
      //if(current_game_tick < game_length / 2){
        //if(game_length - current_game_tick in state_history){
          //state['f_pos_x'] = state_history[game_length - current_game_tick]['pos_x'];
          //state['f_pos_y'] = state_history[game_length - current_game_tick]['pos_y'];
        //}
      //}
      state['f_pos_x'] = state_history[game_length - 1]['pos_x'];
      state['f_pos_y'] = state_history[game_length - 1]['pos_y'];
      state = physics_engine_step(state, undefined);
      renderer(state);
      current_game_tick += 1;
    }
  }
}

setInterval(mainLoop, 10);


function root_clone(obj){
  var clone = {};
  for(var key in obj){
    clone[key] = obj[key];
  }
  return clone;
}

function physics_engine_step(state, renderer){
  var state_copy = root_clone(state);
  //var tick_counter = 0;
  //var state_history = [state_copy];
  state_copy['pos_x'] += state_copy['v_x'];
  state_copy['pos_y'] += state_copy['v_y'];
  state_copy['v_x'] += state_copy['a_x'];
  state_copy['v_y'] += state_copy['a_y'];

  //collision
  if(state_copy['pos_x'] <= state_copy['radius']
    || state_copy['pos_x'] >= state_copy['field_width'] - state_copy['radius'] ){
    state_copy['v_x'] = -state_copy['v_x'];
  }
  if(state_copy['pos_y'] <= state_copy['radius']
    || state_copy['pos_y'] >= state_copy['field_height'] - state_copy['radius'] ){
    state_copy['v_y'] = -state_copy['v_y'];
  }
  if(renderer !== undefined){
    renderer(state_copy);
  }
  return state_copy;
}

// state:
// {'v_x': 1,
//  'v_y': 1,
//  'a_x': 0.1,
//  'a_y': 0.1,
//  'pos_x': 10,
//  'pos_y': 10,
//  'radius': 5,
//  'field_width': 600,
//  'field_height': 600,
//  'num_of_ticks': 6000
// }
function physics_engine(state, num_of_ticks, tick_generator, renderer){
  var state_copy = root_clone(state);
  var tick_counter = 0;
  var state_history = [state_copy];
  while(tick_counter < num_of_ticks){
    var ticks_moved = tick_generator();
    if(ticks_moved > 0){
      state_copy['pos_x'] += state_copy['v_x'] * ticks_moved;
      state_copy['pos_y'] += state_copy['v_y'] * ticks_moved;
      state_copy['v_x'] += state_copy['a_x'] * ticks_moved;
      state_copy['v_y'] += state_copy['a_y'] * ticks_moved;

      //collision
      if(state_copy['pos_x'] <= state_copy['radius']
        || state_copy['pos_x'] >= state_copy['field_width'] - state_copy['radius'] ){
        state_copy['v_x'] = -state_copy['v_x'];
      }
      if(state_copy['pos_y'] <= state_copy['radius']
        || state_copy['pos_y'] >= state_copy['field_height'] - state_copy['radius'] ){
        state_copy['v_y'] = -state_copy['v_y'];
      }
      tick_counter += ticks_moved;
      if(renderer !== undefined){
        renderer(state_copy);
      }
    }
    state_history.push(root_clone(state_copy));
  }
  return state_history;
}

//physics_engine(state, 6000, gen_tick_time, renderer);

#!/usr/bin/env python
import time
import threading
from time import sleep
from random import randint

current_state = {'pos': 0, 'velocity': 1, 'time': 0, 'in_game': False}

def add_goal(cur_view, goal_pos):
    cur_view_length = len(cur_view)
    # print cur_view_length, goal_pos
    if cur_view_length < goal_pos + 1:
        cur_view = cur_view + ' ' * (goal_pos - cur_view_length + 1)
    # print len(cur_view), goal_pos
    # print '---'
    to_replace = '*'
    if cur_view[goal_pos] == 'o':
        to_replace = '@'
    result = cur_view[0: goal_pos] + to_replace + cur_view[goal_pos + 1:]
    return result

def plotter(init_pos, duration, goal):
    global current_state
    with open('cur', 'a') as view:
        with open('fut', 'a') as f_view:
            current_state['pos'] = init_pos
            cur_game_view = (' ' * (init_pos))  + 'o'
            cur_game_view = add_goal(cur_game_view, goal)
            view.write(cur_game_view +  '\n')
            view.flush()
            fut_game_view = (' ' * (init_pos + duration * current_state['velocity']))  + 'o'
            fut_game_view = add_goal(fut_game_view, goal)
            f_view.write(fut_game_view + '\n')
            f_view.flush()
            start_time = time.time()
            prev_time = start_time
            cur_time = start_time
            seconds_passed = 0
            while cur_time < start_time + duration:
                cur_time = time.time()
                if cur_time - prev_time < 0.1:
                    sleep(0.8)
                elif cur_time - prev_time > 0.99:
                    current_state['pos'] = current_state['pos'] + current_state['velocity']
                    cur_game_view = (' ' * (current_state['pos']))  + 'o'
                    cur_game_view = add_goal(cur_game_view, goal)
                    view.write(cur_game_view + '\n')
                    view.flush()

                    seconds_passed += 1
                    future_from_now = duration - seconds_passed
                    fut_game_view = (' ' * (current_state['pos'] + future_from_now * current_state['velocity']))  + 'o'
                    fut_game_view = add_goal(fut_game_view, goal)
                    f_view.write(fut_game_view + '\n')
                    f_view.flush()
                    prev_time = cur_time
                # else:
                    # print 'cur_time', cur_time
                    # print 'prev_time', prev_time
            f_view.write('-----------------------------------------------------------------------------------------\n')
            f_view.write('-----------------------------------------------------------------------------------------\n')
        view.write('-----------------------------------------------------------------------------------------\n')
        view.write('-----------------------------------------------------------------------------------------\n')


def future_plotter(init_pos, duration):
    global current_state
    with open('fut', 'a') as view:
        current_state['pos'] = init_pos
        view.write((' ' * (init_pos - 1 + duration * current_state['velocity']))  + 'o\n')
        view.flush()
        start_time = time.time()
        prev_time = start_time
        cur_time = start_time
        while cur_time < start_time + duration:
            cur_time = time.time()
            if cur_time - prev_time < 0.1:
                sleep(0.8)
            elif cur_time - prev_time > 0.99:
                seconds_passed += 1
                future_from_now = int(duration - seconds_passed)
                view.write((' ' * (current_state['pos'] + future_from_now * current_state['velocity']))  + 'o\n')
                view.flush()
                prev_time = cur_time
        view.write('-----------------------------------------------------------------------------------------\n')
        view.write('-----------------------------------------------------------------------------------------\n')


while True:
    text = raw_input("command> ")
    if text == 'start' and not current_state['in_game']:
        goal = randint(0, 99)
        t = threading.Thread(target=plotter, args=(50, 30, goal))
        t.start()
    else:
        try:
            print 'velocity changed to:', int(text)
            current_state['velocity'] = int(text)
        except:
            print 'wrong velocity'
            pass





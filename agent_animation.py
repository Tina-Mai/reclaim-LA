#!/usr/bin/env python3

import sys
import time
import random
import os
from typing import List
import threading
import curses
from curses import wrapper

BRAIN_FRAMES = [
    '''
    ╭────────────╮
    │  ▗▄▄▄▄▄▄▟  │
    │ ▗▛▀▀▜▛▀▀▜  │
    │ ▐▄▄▌▐▄▄▌   │
    │  ▝▀▀▀▀▀▘   │
    ╰────────────╯
    ''',
    '''
    ╭────────────╮
    │  ▗▄▄▄▄▄▄▟  │
    │ ▗▛▀▀▜▛▀▀▜  │
    │ ▐▀▀▌▐▀▀▌   │
    │  ▝▄▄▄▄▄▘   │
    ╰────────────╯
    '''
]

NETWORK_FRAMES = [
    '''
     ◉────◉────◉
     │╲   │   ╱│
     │ ╲  │  ╱ │
     │  ╲ │ ╱  │
     │   ╲│╱   │
     ◉────◉────◉
     │   ╱│╲   │
     │  ╱ │ ╲  │
     │ ╱  │  ╲ │
     │╱   │   ╲│
     ◉────◉────◉
    ''',
    '''
     ○────○────○
     │╲   │   ╱│
     │ ╲  │  ╱ │
     │  ╲ │ ╱  │
     │   ╲│╱   │
     ◉────◉────◉
     │   ╱│╲   │
     │  ╱ │  ╲ │
     │ ╱  │   ╲│
     │╱   │    ╲
     ○────○────○
    '''
]

RESEARCH_PHASES = [
    "Initializing research agent...",
    "Loading knowledge base...",
    "Analyzing research topic...",
    "Generating search queries...",
    "Processing web research...",
    "Synthesizing information...",
    "Generating debate perspectives...",
    "Evaluating sources...",
    "Cross-referencing data...",
    "Formulating insights...",
]

def get_terminal_size():
    return os.get_terminal_size()

class ResearchAnimation:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.term_height, self.term_width = stdscr.getmaxyx()
        self.current_phase = 0
        self.progress = 0
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_GREEN, -1)
        curses.init_pair(2, curses.COLOR_CYAN, -1)
        curses.init_pair(3, curses.COLOR_YELLOW, -1)
        curses.curs_set(0)  # Hide cursor

    def draw_frame(self, frame: str, y: int, x: int, color_pair: int = 0):
        for i, line in enumerate(frame.split('\n')):
            try:
                self.stdscr.addstr(y + i, x, line, curses.color_pair(color_pair))
            except curses.error:
                pass

    def draw_progress_bar(self, y: int, width: int, progress: float, track: str):
        bar_width = width - 20
        filled = int(bar_width * progress)
        bar = f"{'█' * filled}{'░' * (bar_width - filled)}"
        try:
            self.stdscr.addstr(y, 2, f"Track {track}: ", curses.color_pair(2))
            self.stdscr.addstr(y, 12, f"[{bar}]", curses.color_pair(1))
        except curses.error:
            pass

    def draw_status(self, y: int, status: str):
        try:
            self.stdscr.addstr(y, 2, status, curses.color_pair(3))
        except curses.error:
            pass

    def animate(self):
        brain_frame = 0
        network_frame = 0
        
        while True:
            self.stdscr.clear()
            
            # Draw brain animation
            self.draw_frame(BRAIN_FRAMES[brain_frame], 2, 
                          self.term_width - 20, 2)
            brain_frame = (brain_frame + 1) % len(BRAIN_FRAMES)
            
            # Draw network
            self.draw_frame(NETWORK_FRAMES[network_frame], 2, 2, 1)
            network_frame = (network_frame + 1) % len(NETWORK_FRAMES)
            
            # Draw progress bars
            self.draw_progress_bar(15, self.term_width - 4, 
                                 self.progress, "One")
            self.draw_progress_bar(16, self.term_width - 4, 
                                 self.progress * 0.8, "Two")
            
            # Draw current phase
            phase = RESEARCH_PHASES[self.current_phase]
            self.draw_status(18, f"Current Phase: {phase}")
            
            # Update progress
            self.progress += 0.01
            if self.progress >= 1:
                self.progress = 0
                self.current_phase = (self.current_phase + 1) % len(RESEARCH_PHASES)
            
            self.stdscr.refresh()
            time.sleep(0.1)

def main(stdscr):
    animation = ResearchAnimation(stdscr)
    animation.animate()

if __name__ == "__main__":
    try:
        wrapper(main)
    except KeyboardInterrupt:
        print("\nAnimation stopped.")
        sys.exit(0) 
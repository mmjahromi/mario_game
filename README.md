# Mario Game Project

This repository contains a terminal-based Mario game implemented in C using the `ncurses` library. The game features levels with increasing difficulty, moving blocks, and an enemy character. The player controls Mario to avoid obstacles and reach the end of each level.

## Features

- **Dynamic Levels:** The game consists of 10 levels, with increasing speed for blocks and the enemy as levels progress.
- **Game Mechanics:**
  - Blocks move horizontally across the screen.
  - An enemy character chases Mario.
  - If Mario collides with a block or the enemy, the game resets to level 1.
- **Controls:** Responsive arrow keys to control Mario's movement.
- **Terminal Graphics:** Utilizes the `ncurses` library for rendering the game in the terminal.

## Controls

- `Arrow Keys`: Move Mario (`M`) around the screen.
- `q`: Quit the game.

## Requirements

- A C compiler (e.g., `gcc`)
- `ncurses` library installed on your system

### Installing `ncurses`

#### On macOS:
```bash
brew install ncurses
```

#### On Ubuntu/Debian:
```bash
sudo apt-get install libncurses5-dev libncursesw5-dev
```

## How to Compile and Run

1. Clone the repository:
   ```bash
   git clone https://github.com/mmjahromi/mario_game.git
   cd mario_game
   ```

2. Compile the game using `gcc`:
   ```bash
gcc -o mario mario.c -lncurses
   ```

3. Run the game:
   ```bash
   ./mario
   ```

## Gameplay

1. Mario starts at the left side of the screen and must avoid blocks and the enemy.
2. Reach the right edge of the screen to advance to the next level.
3. Game resets to level 1 if Mario collides with a block or the enemy.

## Contributions

Contributions, bug reports, and feature requests are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

- **mmjahromi**


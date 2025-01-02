#include <ncurses.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>

#define WIDTH 40
#define HEIGHT 15
#define BASE_SPEED 150000 // Initial block speed in microseconds
#define SPEED_INCREMENT 15000 // Block speed increment per level
#define BASE_ENEMY_INTERVAL 20 // Base interval for enemy movement
#define ENEMY_SPEED_DECREMENT 2 // Reduction in interval per level
#define MAX_LEVEL 10

void generateScreen(char screen[HEIGHT][WIDTH]) {
    for (int i = 0; i < HEIGHT; i++) {
        for (int j = 0; j < WIDTH; j++) {
            if (i == 0 || i == HEIGHT - 1 || j == 0 || j == WIDTH - 1) {
                screen[i][j] = '*'; // Border character
            } else {
                screen[i][j] = ' '; // Empty space
            }
        }
    }

    // Randomly place initial blocks
    for (int i = 1; i < HEIGHT - 1; i++) {
        if (rand() % 2 == 0) { // Randomize rows with blocks
            int blockStart = rand() % (WIDTH - 2) + 1; // Random start position
            screen[i][blockStart] = '#';
        }
    }
}

void moveBlocks(char screen[HEIGHT][WIDTH]) {
    for (int i = 1; i < HEIGHT - 1; i++) {
        for (int j = WIDTH - 2; j > 0; j--) {
            if (screen[i][j] == '#') {
                screen[i][j] = ' '; // Clear current block
                if (j > 1) {
                    screen[i][j - 1] = '#'; // Move block left
                }
            }
        }
    }

    // Add new blocks randomly on the right
    for (int i = 1; i < HEIGHT - 1; i++) {
        if (rand() % 10 == 0) { // 10% chance of new block
            screen[i][WIDTH - 2] = '#';
        }
    }
}

void moveEnemy(int *enemyX, int *enemyY, int marioX, int marioY) {
    if (*enemyX < marioX) {
        (*enemyX)++;
    } else if (*enemyX > marioX) {
        (*enemyX)--;
    }

    if (*enemyY < marioY) {
        (*enemyY)++;
    } else if (*enemyY > marioY) {
        (*enemyY)--;
    }
}

void displayScreen(char screen[HEIGHT][WIDTH], int marioX, int marioY, int enemyX, int enemyY, int level) {
    clear(); // Clear the screen for redrawing

    // Draw the screen
    for (int i = 0; i < HEIGHT; i++) {
        for (int j = 0; j < WIDTH; j++) {
            mvprintw(i, j, "%c", screen[i][j]);
        }
    }

    // Draw Mario and Enemy
    mvprintw(marioY, marioX, "M");
    mvprintw(enemyY, enemyX, "E");

    // Display the current level
    mvprintw(0, WIDTH / 2 - 5, "Level: %d", level);

    refresh(); // Refresh the screen to show changes
}

int detectCollision(int x1, int y1, int x2, int y2) {
    return (x1 == x2 && y1 == y2); // Return 1 if positions match
}

void resetGame(int *level, int *blockSpeed, int *enemyInterval, int *marioX, int *marioY, int *enemyX, int *enemyY, char screen[HEIGHT][WIDTH]) {
    *level = 1;
    *blockSpeed = BASE_SPEED;
    *enemyInterval = BASE_ENEMY_INTERVAL;
    *marioX = 1;
    *marioY = HEIGHT - 2;
    *enemyX = WIDTH - 2;
    *enemyY = 1;
    generateScreen(screen);
}

int main() {
    srand(time(NULL)); // Seed for random number generation

    char screen[HEIGHT][WIDTH];
    int marioX = 1, marioY = HEIGHT - 2; // Mario's initial position
    int enemyX = WIDTH - 2, enemyY = 1;  // Enemy's initial position
    int level = 1;                      // Starting level
    int blockSpeed = BASE_SPEED;        // Initial block speed
    int enemyCounter = 0;               // Tracks enemy movement timing
    int enemyInterval = BASE_ENEMY_INTERVAL; // Enemy movement interval

    generateScreen(screen);

    initscr(); // Initialize ncurses mode
    keypad(stdscr, TRUE); // Enable arrow key input
    noecho(); // Disable key echo
    curs_set(0); // Hide the cursor

    int ch;
    while (1) {
        // Update blocks and enemy
        moveBlocks(screen);

        if (++enemyCounter >= enemyInterval) {
            moveEnemy(&enemyX, &enemyY, marioX, marioY);
            enemyCounter = 0;
        }

        // Display the screen
        displayScreen(screen, marioX, marioY, enemyX, enemyY, level);

        // Check for collisions
        if (detectCollision(marioX, marioY, enemyX, enemyY) || screen[marioY][marioX] == '#') {
            mvprintw(HEIGHT / 2, WIDTH / 2 - 5, "GAME OVER!");
            refresh();
            usleep(2000000); // Pause for 2 seconds
            resetGame(&level, &blockSpeed, &enemyInterval, &marioX, &marioY, &enemyX, &enemyY, screen);
            continue; // Restart game loop
        }

        // Check if Mario reached the end
        if (marioX == WIDTH - 2) {
            level++;
            if (level > MAX_LEVEL) {
                mvprintw(HEIGHT / 2, WIDTH / 2 - 7, "CONGRATULATIONS!");
                refresh();
                usleep(2000000); // Pause for 2 seconds
                resetGame(&level, &blockSpeed, &enemyInterval, &marioX, &marioY, &enemyX, &enemyY, screen);
                continue; // Restart game loop
            }

            // Reset Mario's position and increase speed
            marioX = 1;
            marioY = HEIGHT - 2;
            blockSpeed -= SPEED_INCREMENT;
            enemyInterval = BASE_ENEMY_INTERVAL - (level * ENEMY_SPEED_DECREMENT);
            if (enemyInterval < 5) { // Ensure the enemy doesn't move too fast
                enemyInterval = 5;
            }
            generateScreen(screen);
        }

        // Handle user input
        nodelay(stdscr, TRUE); // Non-blocking input
        ch = getch();
        switch (ch) {
            case KEY_UP:
                if (marioY > 1) marioY--;
                break;
            case KEY_DOWN:
                if (marioY < HEIGHT - 2) marioY++;
                break;
            case KEY_LEFT:
                if (marioX > 1) marioX--;
                break;
            case KEY_RIGHT:
                if (marioX < WIDTH - 2) marioX++;
                break;
            case 'q': // Quit the game
                endwin(); // End ncurses mode
                return 0;
        }

        usleep(blockSpeed / 10); // Adjust timing for better responsiveness
    }

    endwin(); // End ncurses mode
    return 0;
}

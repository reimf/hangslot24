# Game Specification

## The padlock

The screen shows a padlock with 3 rows of buttons, centred on a dark background.
The padlock and buttons have no border, no shadow, and no gradient.
All buttons look exactly the same: the same shape, the same size, exactly the same colours (foreground, background, and border), the same border width, etc.
The buttons are square with rounded corners and sit visibly above the lock body.
The spacing between buttons is equal in all directions — horizontally and vertically, including between rows, including between the 2nd and 3rd row.
There is no unnecessary space around the buttons, nor below them.
The padlock has realistic proportions.
The shackle is exaggeratedly thick and almost as wide as the lock body.
Only a semicircular arc with short straight sections is visible; the rest is hidden behind the lock body.
The first row has 4 buttons with numbers on them (1–9), for example 2, 4, 8 and 8.
The second row has 4 buttons with operators: +, −, × and ÷.
The third row has an undo button (↶) on the left, a hint button (💡) next to it, and to their right a column of up to 3 calculation history lines.
A clickable button visibly changes label colour to the accent colour when the user hovers over it with the mouse (without flickering).

### Button states

- **Normal**: white background, dark-blue text.
- **Disabled**: nearly transparent background with nearly visible text.
- **Selected**: light-blue background, white text.

### Level indicator

The difficulty level is displayed on the shackle as a star rating (top line) and a text label (bottom line):

| Level  | Stars | Colour |
|--------|-------|--------|
| Easy   | ★☆☆   | Green  |
| Medium | ★★☆   | Orange |
| Hard   | ★★★   | Red    |

### Score and points

A score box is shown in the top-right corner of the canvas. It displays the player's cumulative score.
The points text is displayed inside the shackle arch. At the start of each puzzle it shows `+100`.

## Gameplay

### Phases

The game progresses through phases:

| Phase | Level(s)                    | Puzzles |
|-------|-----------------------------|---------|
| 1     | Easy only                   | 3       |
| 2     | Medium only                 | 3       |
| 3     | Hard only                   | 3       |
| 4     | Random mix of all 3 levels  | ∞       |

At the start of each puzzle within a phase, a random combination for the current level is selected, and its four numbers are displayed in a random order on the number buttons.

### Selecting an operation

The user clicks any two number buttons and one operator button in any order.
As soon as all three have been selected, the move is attempted immediately.

Clicking an already-selected button deselects it.
If 2 number buttons are selected and the user clicks a third unselected number, the newly clicked number replaces the first selected number and the second selected number is deselected.

### Calculating

When all three selections are complete, the move is performed if possible.

A move is invalid if it divides by zero, produces a negative number, or is a fraction.

If the move is valid, it is applied immediately (no delay):
- The first number button's value is replaced by the result.
- The second number button is hidden.
- The calculation (e.g. `6 × 4 = 24`) is appended to the calculation history, shown in the third row to the right of the undo and hint buttons.
- The result button (at the second number's index) is pre-selected.

The user does this 3 times until only 1 number button remains (the other 3 are hidden).

### Win condition

If the final number is 24, the win animation plays:

1. The shackle smoothly slides up such that the right leg of the shackle is above the lock body.
2. After 1 sec the shackle mirrors horizontally so the right leg is now the free side; the level indicator fades out.
3. After 0.5 sec the points text animates from the arch to the score box.
4. After 1 sec the cumulative score is incremented by the current points value and updated in the score box; the points text is hidden.
5. After 0.5 sec the shackle mirrors back to its original orientation.
6. After 1 sec the shackle smoothly slides back down.
7. After 1 sec a new puzzle starts.

### Lose condition / dead end

If the final number is not 24, all number buttons, operator buttons, undo button, and hint button are disabled.
The dead-end state can only be escaped by undoing all moves back to a point where a valid path to 24 still exists.
Restarting happens automatically only after a win.

### Undo

The ↶ button is disabled when:
- No moves have been made yet (nothing to undo), or
- The game is finished (solved or dead end).

After each valid operation the previous numbers are saved.
Pressing ↶ restores the previous set of numbers, clears the selection, and re-enables all buttons.

### Hint

The 💡 button shows `−50` in small text below the icon as a cost reminder.
It is disabled when:
- The game is finished, or
- The previous hint attempt found no valid continuation (i.e. no move leads to any remaining solution path).

When pressed:
1. The current points value is reduced by 50 (minimum 0).
2. All moves that are valid and still lead to a solution path are found.
3. If none exist, the hint button is disabled for the rest of the puzzle; nothing else changes.
4. If at least one exists, a random hint is chosen, applied as a normal move, and its result button is pre-selected.

## Technology

- Use SVG, CSS and TypeScript
- Use CSS transitions and animations
- Do not use any external libraries

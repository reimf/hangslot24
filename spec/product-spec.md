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
The third row has a button on the left with the label ← that undoes the previous operation, and in the bottom-right corner the text "hangslot24" is engraved against the bottom and right edge of that row.
A clickable button visibly changes label colour to the accent colour when the user hovers over it with the mouse (without flickering).

## Gameplay

The game starts by generating 4 random integers (1–9) that are guaranteed to have at least one path to 24 using the available operators. These numbers are displayed on the four number buttons.

### Selecting an operation

The user clicks a number button and it is immediately visibly highlighted (orange background, white label).
Then the user clicks an operator button, which is also immediately visibly highlighted.
Finally the user clicks a different number button, which is also immediately visibly highlighted.

Clicking the already-selected first number button again deselects it and clears the operator selection.

An operation is invalid if it divides by zero, produces a negative number, or does not result in a whole number.
If the operation is invalid, the visible highlights disappear and nothing else happens.

### Calculating

If the operation is valid, all buttons are disabled while the calculation is in progress (1 second).
During that second the first number button's label temporarily shows the full expression (e.g. `6×4`).
The second number button is immediately hidden (its background becomes the lock-body colour and the label disappears).
After 1 second the first number button's label changes to the result of the operation, all buttons are re-enabled, and the selection is cleared.

The user does this 3 times until only 1 number button remains (the other 3 are hidden).

### Win condition

If the final number is 24, the shackle smoothly rises without rotation so that the right side visibly comes free from the body.
The left side of the shackle remains visibly attached to the body with a straight section.
The right side of the shackle has a short straight section with a rounded end, and on its left side a semicircle that goes approximately 1/3 of the shackle width deep, making the background visible (this is the locking groove). The locking groove is fully hidden behind the lock body when the lock is closed.
After 3 seconds the shackle goes back down and after a further 1 second the game restarts with a new set of numbers.

### Lose condition / dead end

If the final number is not 24, the number button and all operator buttons are disabled (greyed out) and the game waits for the user to press the ← button.

### Undo

The ← button is disabled when there is nothing to undo.
After each valid operation the previous state (list of visible numbers) is pushed onto a history stack.
Pressing ← restores the previous state, re-enables everything, and clears any dead-end condition.

## Technology

- Use SVG, CSS and TypeScript
- Use CSS transitions for the shackle open/close animation
- Do not use any external libraries

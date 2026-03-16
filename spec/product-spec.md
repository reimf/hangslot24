# Game Specification

## The padlock

The screen shows a padlock with 3 rows of buttons.
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
A clickable button visibly changes colour when the user hovers over it with the mouse (without flickering).

## Gameplay

The user clicks a number button and it is immediately visibly highlighted.
Then the user clicks an operator button, which is also immediately visibly highlighted.
Finally the user clicks a different number button, which is also immediately visibly highlighted.
An operation is invalid if it divides by zero, produces a negative number, or does not result in a whole number.
If the operation is invalid, the visible highlights disappear and nothing else happens.
If the operation is valid, a copy of the operator button appears, visibly highlighted (just like the selected buttons). The highlight on the original operator button disappears immediately when the copy appears.
The copy of the operator button moves in a smooth line — visibly over (not under) the 1st number button — over the course of 1 second.
Simultaneously, the 2nd number button also moves in a smooth line — visibly over (not under) the operator button copy, which is itself moving over the 1st number button — also over 1 second.
The buttons must visibly move; the animation must be smooth and must not jump.
Once all buttons are stacked on top of each other, the number on the button changes to the result of the operation.
The other buttons stay in place.
The user does this 3 times until only 1 number button remains.
If the number on that button is 24, the shackle smoothly rises without rotation so that the right side visibly comes free from the body.
The left side of the shackle remains visibly attached to the body with a straight section.
The right side of the shackle has a short straight section with a rounded end, and on its left side a semicircle that goes approximately 1/3 of the shackle width deep, making the background visible (this is the locking groove). The locking groove is fully hidden behind the lock body when the lock is closed.
The right side visibly comes free from the body.
After 3 seconds the shackle goes back down and the game restarts.
If the number on that button is not 24, the number button and operator buttons are disabled and the game waits for the user to press the ← button.

## Technology

- Use SVG, CSS and TypeScript
- Use the Web Animations API for animations
- Do not use any external libraries

## UX

    - If "ESC" is pressed, deselect all snippets;
    - Make snippet grid navigateable with only keyboard;
    - When a snippet is in focus and "SPACE" or "ENTER" is pressed, toggle the selection for the snippet.

#### Optional

    - Instead of forcing user to drag and drop, add a menu that pops up on "CTRL+SHIFT+P" with which you can add snippets to selected folders;
    - When copying a snippet, as well as writing to clipboard, register a command where if you type "snip" in your editor and press enter it automatically inserts the copied snippet. Further improvements on this could be supporting user-defined shortcuts for their saved snippets.

## Code related

    - I feel like the way I am setting the image that gets displayed when dragging snippets is braindead;
    - Join related card snippet logic in a single hook and use it in each card;
    - Make use of axios request return codes to eliminate flickering ui.

# Claude's View of Cursor Events

When a user is working with Claude, their cursor movements generate a stream of events that Claude receives as part of its context. Here's how it looks:

## Example Conversation

**User**: "Can you help me understand this code?"

**Context**: User's cursor is in `/src/components/Button.tsx` at line 15
```typescript
export const Button = ({ children, onClick }) => {
  // <cursor>
  const handleClick = (e) => {
    e.preventDefault();
    onClick(e);
  };
```

**Claude**: "I see you're looking at the Button component's click handler. This function prevents the default button behavior and..."

**Context**: User moved cursor to line 25 in same file
```typescript
  return (
    <button 
      // <cursor>
      className={styles.button}
      onClick={handleClick}
    >
```

**Claude**: "Now you're looking at the button's JSX. The className here uses CSS modules for styling, and the click handler we just looked at is being..."

**Context**: User switched to `/src/styles/button.module.css` line 5
```css
.button {
  /* <cursor> */
  background: var(--primary-color);
  padding: 8px 16px;
}
```

**Claude**: "Ah, and here's the styling for that button. It's using CSS custom properties for the background color..."

## Key Points

1. Claude always knows:
   - What file the user is viewing
   - Where their cursor is
   - What code surrounds the cursor
   - If they've selected any text

2. This lets Claude:
   - Give more contextual responses
   - Follow the user's focus in real-time
   - Reference specific parts of code
   - Understand the user's current context

3. Events are streamed naturally:
   - No need to paste code snippets
   - No need to explain where you are
   - Claude just "sees" what you're looking at

The goal is to make it feel like Claude is pair programming with you - seeing exactly what you're seeing as you move through the code.

/**
 * Inline "ghost text" completion for the command prompt.
 *
 * Given what the user has typed so far and the known command names, return the
 * remainder of the best match (the part still to type), or null when there is
 * nothing to suggest. Matching is case-insensitive against the canonical
 * (lowercase) names, and the remainder is the canonical spelling so accepting
 * it yields a runnable command. Only the command-name token is completed: once
 * the input contains whitespace the name is finished and no suggestion is made.
 */
export function suggestCompletion(input: string, names: string[]): string | null {
  if (!input || /\s/.test(input)) return null;
  const prefix = input.toLowerCase();
  for (const name of names) {
    if (name.length > prefix.length && name.startsWith(prefix)) {
      return name.slice(input.length);
    }
  }
  return null;
}

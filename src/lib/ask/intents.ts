/**
 * Natural-language intents that route to a terminal command.
 *
 * These are the "smart fallback" half of ask-as-default: when a visitor types
 * free text that isn't a known command, the embedder ranks it against both the
 * curated knowledge base (informational questions) AND these phrasings (action
 * intents). When an intent wins, the terminal offers to run the command rather
 * than auto-firing it — so a fuzzy guess never silently wipes the screen or
 * opens a tab.
 *
 * Keep phrases action-flavored ("show me your work", "switch to dark mode") so
 * they don't fight the knowledge base, whose questions are informational
 * ("what is your background"). Every `command` must be a real command name.
 */
export type CommandIntent = {
  /** The command to route to. Must match a registered command name. */
  command: string;
  /** Phrasings a visitor might type to mean this command; each is embedded. */
  phrases: string[];
};

export const commandIntents: CommandIntent[] = [
  {
    command: 'help',
    phrases: ['what can I do here', 'show me everything', 'list the commands', 'what are my options'],
  },
  {
    command: 'links',
    phrases: ['where can I find you online', 'your social media', 'linkedin and github', 'how do I follow you'],
  },
  {
    command: 'writing',
    phrases: ['read your writing', 'take me to your blog', 'show me your essays', 'where are your articles'],
  },
  {
    command: 'contact',
    phrases: ['how do I get in touch', 'show me your contact details', 'save your contact card', 'send you a message'],
  },
  {
    command: 'theme',
    phrases: ['switch to dark mode', 'turn on light mode', 'change the theme', 'toggle dark and light'],
  },
  {
    command: 'game',
    phrases: ['show me your work', 'play the game', 'explore the planet', 'let me explore'],
  },
  {
    command: 'globe',
    phrases: ['where have you traveled', 'places you have been', 'show me the globe', 'your travels'],
  },
];

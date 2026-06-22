export type Tone = 'normal' | 'dim' | 'accent' | 'soon';

/** One styled span within a terminal line. */
export type Segment = { text: string; href?: string; tone?: Tone };

/** A terminal line is an ordered list of segments. */
export type Line = Segment[];

export type CommandMeta = {
  name: string;
  description: string;
  /** Listed under "coming soon" in help; still runnable (prints a teaser). */
  soon?: boolean;
};

export type CommandContext = {
  setTheme: (t: 'light' | 'dark') => void;
  getTheme: () => 'light' | 'dark';
  /** Clears the terminal output history. */
  clear: () => void;
  /** Switches the terminal into interactive "ask-mode" (loads the browser model). */
  enterAsk: () => void;
  /** Opens a URL in a new browser tab. */
  open: (url: string) => void;
  links: { label: string; href: string; handle: string }[];
  /** Public command metadata, used by `help`. */
  commands: CommandMeta[];
};

export type Command = CommandMeta & {
  hidden?: boolean;
  run: (ctx: CommandContext, args: string[]) => Line[];
};

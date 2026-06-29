import type { Command, CommandContext, Line, Tone } from './types';
import { nextTheme } from '../theme';

/** Build a single-segment line. */
const line = (text: string, tone?: Tone): Line => [{ text, tone }];
const blank = (): Line => [{ text: '' }];

/**
 * Builds a command that opens the resolved url in a new browser tab and prints a
 * one-line "click here" fallback, so a blocked popup still leaves something
 * clickable. `resolveUrl` yields the destination, or undefined to render the
 * fallback text without a live link. Generalises the original `game` behaviour.
 */
const opensTab = (
  name: string,
  description: string,
  blurb: string,
  resolveUrl: (ctx: CommandContext) => string | undefined,
): Command => ({
  name,
  description,
  run: (ctx): Line[] => {
    const url = resolveUrl(ctx);
    if (url) ctx.open(url);
    return [
      [
        { text: `${blurb} in a new tab… if blocked, `, tone: 'dim' },
        { text: 'click here', href: url, tone: 'accent' },
      ],
    ];
  },
});

const about: Command = {
  name: 'about',
  description: 'who I am',
  run: () => [
    line('Rodrigo S. Calderon — Full-Stack AI Engineer, based in Miami.'),
    line('Experienced builder. Former management consultant at EY-Parthenon and Chief of Staff to CEOs.'),
  ],
};

const linksCmd: Command = {
  name: 'links',
  description: 'where to find me',
  run: (ctx) =>
    ctx.links.map((l) => [
      { text: l.label.padEnd(10), tone: 'normal' as Tone },
      { text: l.handle, href: l.href, tone: 'accent' as Tone },
    ]),
};

const writing = opensTab('writing', 'my essays', 'Opening my writing', (ctx) =>
  ctx.links.find((l) => l.label === 'Medium')?.href,
);

const contact = opensTab('contact', 'save my details', 'Opening my contact card', () => '/contact-info');

const theme: Command = {
  name: 'theme',
  description: 'toggle light / dark',
  run: (ctx) => {
    const t = nextTheme(ctx.getTheme());
    ctx.setTheme(t);
    return [line(`theme → ${t}`, 'dim')];
  },
};

const clear: Command = {
  name: 'clear',
  description: 'wipe the screen',
  run: (ctx) => {
    ctx.clear();
    return [];
  },
};

const help: Command = {
  name: 'help',
  description: 'show this list',
  run: (ctx) => {
    const out: Line[] = [];
    const core = ctx.commands.filter((c) => !c.soon);
    const soon = ctx.commands.filter((c) => c.soon);
    for (const c of core) {
      out.push([
        { text: '  ' + c.name.padEnd(10), tone: 'accent' },
        { text: c.description, tone: 'dim' },
      ]);
    }
    if (soon.length) {
      out.push(blank());
      out.push(line('coming soon', 'dim'));
      for (const c of soon) {
        out.push([
          { text: '  ' + c.name.padEnd(10), tone: 'soon' },
          { text: c.description, tone: 'dim' },
        ]);
      }
    }
    return out;
  },
};

const travel = opensTab('travel', "places I've visited", "Opening where I've traveled", () => '/places/visited');

const game = opensTab('game', 'explore my work', 'Launching the planet', () => '/game');

export const coreCommands: Command[] = [
  help,
  about,
  linksCmd,
  writing,
  contact,
  theme,
  clear,
  travel,
  game,
];

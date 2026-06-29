import type { Command, CommandContext, Line, Tone } from './types';
import { nextTheme } from '../theme';

/** Build a single-segment line. */
const line = (text: string, tone?: Tone): Line => [{ text, tone }];
const blank = (): Line => [{ text: '' }];

/**
 * Builds a command that opens `url` in a new browser tab and prints a one-line
 * fallback link, so a blocked popup still leaves something clickable. `resolve`
 * yields the destination plus the fallback link's visible text; if it returns no
 * url (e.g. a link that isn't configured) nothing opens, but the line still
 * renders. Generalises the original `game` behaviour to every nav command.
 */
const opensTab = (
  name: string,
  description: string,
  blurb: string,
  resolve: (ctx: CommandContext) => { url?: string; linkText: string },
): Command => ({
  name,
  description,
  run: (ctx): Line[] => {
    const { url, linkText } = resolve(ctx);
    if (url) ctx.open(url);
    return [
      [
        { text: `${blurb} in a new tab… if blocked, `, tone: 'dim' },
        { text: linkText, href: url, tone: 'accent' },
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

const writing = opensTab('writing', 'my essays', 'Opening my writing', (ctx) => {
  const medium = ctx.links.find((l) => l.label === 'Medium');
  return { url: medium?.href, linkText: medium?.handle ?? '@samourcalderon' };
});

const contact = opensTab('contact', 'save my details', 'Opening my contact card', () => ({
  url: '/contact-info',
  linkText: 'open /contact-info',
}));

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

const travel = opensTab('travel', "places I've visited", "Opening where I've traveled", () => ({
  url: '/places/visited',
  linkText: 'open /places/visited',
}));

const game = opensTab('game', 'explore my work', 'Launching the planet', () => ({
  url: '/game',
  linkText: 'open /game',
}));

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

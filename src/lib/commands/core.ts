import type { Command, Line, Tone } from './types';
import { nextTheme } from '../theme';

/** Build a single-segment line. */
const line = (text: string, tone?: Tone): Line => [{ text, tone }];
const blank = (): Line => [{ text: '' }];

const about: Command = {
  name: 'about',
  description: 'who I am',
  run: () => [
    line('Rodrigo S. Calderon — Full-Stack AI Engineer, based in Miami.'),
    line('[ replace with your real bio ]', 'dim'),
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

const writing: Command = {
  name: 'writing',
  description: 'my essays',
  run: (ctx) => {
    const medium = ctx.links.find((l) => l.label === 'Medium');
    return [
      [
        { text: 'Read my writing on Medium: ' },
        { text: medium?.handle ?? '@samourcalderon', href: medium?.href, tone: 'accent' },
      ],
    ];
  },
};

const contact: Command = {
  name: 'contact',
  description: 'save my details',
  run: () => [
    [
      { text: 'Contact card & vCard download: ' },
      { text: '/contact-info', href: '/contact-info', tone: 'accent' },
    ],
  ],
};

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

/** Roadmap toys: runnable now, but print a teaser until built. */
function soonCmd(name: string, description: string, teaser: string): Command {
  return {
    name,
    description,
    soon: true,
    run: () => [
      [
        { text: `${name} `, tone: 'soon' },
        { text: '— coming soon. ', tone: 'dim' },
        { text: teaser, tone: 'normal' },
      ],
    ],
  };
}

const globe = soonCmd('globe', "places I've been", "An interactive globe of where I've traveled and where I'm based.");
const ask = soonCmd('ask', 'ask about me', 'A browser-based model answers questions about me, from a curated set.');
const game = soonCmd('game', 'explore my work', 'Walk around a tiny planet and explore my portfolio.');

export const coreCommands: Command[] = [
  help,
  about,
  linksCmd,
  writing,
  contact,
  theme,
  clear,
  globe,
  ask,
  game,
];

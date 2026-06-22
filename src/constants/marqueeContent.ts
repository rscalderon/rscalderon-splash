import logoAria from '../../public/work/aria-logo-nobg.png';
import logoTatem from '../../public/work/tatem-logo.png';
import logoEYParthenon from '../../public/work/logo-EYP-darkblue.jpg';
import logoLactolac from '../../public/work/logo-lactolac.png';
import logoYes from '../../public/work/logo-yes-nobg.png';
import logoCodesmith from '../../public/work/logo-codesmith-nobg.ico';

import logoPenn from '../../public/study/UniversityofPennsylvania-logo.png';
import logoBerkeley from '../../public/study/UC-Berkeley-logo.png';
import logoCMU from '../../public/study/CMU-logo.png';

export type MarqueeContent =
  | typeof workMarqueeContent
  | typeof studyMarqueeContent;

export const workMarqueeContent = [
  {
    id: 'Aria',
    src: logoAria,
    alt: 'aria-music-logo',
    w: 150,
  },
  {
    id: 'Tatem',
    src: logoTatem,
    alt: 'Tatem-logo',
    w: 300,
  },
  {
    id: 'EYP',
    src: logoEYParthenon,
    alt: 'EY-Parthenon-logo',
    w: 200,
  },
  {
    id: 'Lactolac',
    src: logoLactolac,
    alt: 'Lactolac-logo',
    w: 100,
  },
  {
    id: 'Yes',
    src: logoYes,
    alt: 'Yes-logo',
    w: 150,
  },
  {
    id: 'Codesmith',
    src: logoCodesmith,
    alt: 'Codesmith-logo',
    w: 50,
  },
] as const;

export const studyMarqueeContent = [
  {
    id: 'Penn',
    src: logoPenn,
    alt: 'University-of_Pennsylvania-logo',
    w: 150,
  },
  {
    id: 'Berkeley',
    src: logoBerkeley,
    alt: 'UC-Berkeley-logo',
    w: 300,
  },
  {
    id: 'CMU',
    src: logoCMU,
    alt: 'Carnegie-Mellon-logo',
    w: 200,
  },
] as const;

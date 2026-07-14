import type { VideoJSON } from '@ilovevideoeditor/core';
import ILoveVideoEditor from '@ilovevideoeditor/core';

export interface ApologyVariables {
  companionName: string;
  userName: string;
  message?: string;
  backgroundImage?: string;
  companionPhoto?: string;
  mood?: 'sincere' | 'playful' | 'dramatic';
}

const moodColors: Record<string, { bg: string; accent: string }> = {
  sincere: { bg: '#1a1a2e', accent: '#e94560' },
  playful: { bg: '#2d1b4e', accent: '#f9a825' },
  dramatic: { bg: '#0f0f23', accent: '#ff0055' },
};

export async function buildApology(vars: ApologyVariables): Promise<VideoJSON> {
  const mood = vars.mood ?? 'sincere';
  const colors = moodColors[mood] ?? moodColors.sincere;

  const $ = new ILoveVideoEditor({
    name: 'Apology',
    width: 1080,
    height: 1920,
    fps: 30,
    backgroundColor: colors.bg,
  });

  if (vars.backgroundImage) {
    const bg = $.addImage({ fit: 'cover' }, { source: vars.backgroundImage });
    bg.animate(
      { filterBlur: 0 },
      { filterBlur: 0.3 },
      { duration: '3s', wait: false },
    );
  }

  // Dark overlay
  $.addEmpty({ width: 1080, height: 1920, fill: 'rgba(0,0,0,0.45)' });

  if (vars.companionPhoto) {
    const photo = $.addImage(
      {
        width: 10,
        height: 10,
        position: [0.5, 0.22],
        cornerRadius: 5,
        fit: 'cover',
      },
      { source: vars.companionPhoto },
    );
    photo.animate(
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1 },
      { duration: '1s' },
    );
  }

  // Title
  const title = $.addText({
    text: `I'm sorry, ${vars.userName}`,
    fontSize: 5.5,
    fontWeight: 800,
    color: colors.accent,
    position: [0.5, 0.42],
    textAlign: 'center',
    opacity: 0,
  });
  title.animate(
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1 },
    { duration: '0.8s', easing: 'easeOut' },
  );

  $.wait('400ms');

  // Body
  const body = $.addText({
    text:
      vars.message ??
      `${vars.companionName} knows they messed up. They miss your smile and promise to do better.`,
    fontSize: 2.8,
    fontWeight: 400,
    color: '#ffffff',
    position: [0.5, 0.54],
    textAlign: 'center',
    lineHeight: 1.5,
    opacity: 0,
  });
  body.animate(
    { opacity: 0, position: [0.5, 0.57] },
    { opacity: 1, position: [0.5, 0.54] },
    { duration: '1s', easing: 'easeOut' },
  );

  $.wait('400ms');

  // Heart / closing
  const closing = $.addText({
    text: 'Forgive me?',
    fontSize: 3.5,
    fontWeight: 700,
    color: colors.accent,
    position: [0.5, 0.68],
    textAlign: 'center',
    opacity: 0,
  });
  closing.animate({ opacity: 0 }, { opacity: 1 }, { duration: '0.8s' });

  $.wait('3s');
  closing.fadeOut('0.6s');
  body.fadeOut('0.6s');
  title.fadeOut('0.6s');

  return $.compile();
}

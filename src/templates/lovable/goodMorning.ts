import type { VideoJSON } from '@ilovevideoeditor/core';
import ILoveVideoEditor from '@ilovevideoeditor/core';

export interface GoodMorningVariables {
  companionName: string;
  userName: string;
  dayNumber?: number;
  message?: string;
  backgroundImage?: string;
  companionPhoto?: string;
}

export async function buildGoodMorning(
  vars: GoodMorningVariables,
): Promise<VideoJSON> {
  const $ = new ILoveVideoEditor({
    name: 'Good Morning',
    width: 1080,
    height: 1920,
    fps: 30,
    backgroundColor: '#ffe4e1',
  });

  // Background image or gradient placeholder
  if (vars.backgroundImage) {
    $.addImage({ fit: 'cover' }, { source: vars.backgroundImage });
  } else {
    $.addEmpty({ width: 1080, height: 1920, fill: '#ffe4e1' });
  }

  // Soft overlay for readability
  $.addEmpty({ width: 1080, height: 1920, fill: 'rgba(0,0,0,0.25)' });

  // Companion photo (circular crop via corner radius would need a group or mask;
  // here we use a square with rounded corners)
  if (vars.companionPhoto) {
    const photo = $.addImage(
      {
        width: 12,
        height: 12,
        position: [0.5, 0.25],
        cornerRadius: 6,
        fit: 'cover',
      },
      { source: vars.companionPhoto },
    );
    photo.animate(
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1 },
      { duration: '0.8s' },
    );
  }

  // Greeting text
  const greeting = $.addText({
    text: `Good morning, ${vars.userName}!`,
    fontSize: 5,
    fontWeight: 700,
    color: '#ffffff',
    position: [0.5, 0.45],
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowBlur: 0.3,
  });
  greeting.animate(
    { opacity: 0, position: [0.5, 0.48] },
    { opacity: 1, position: [0.5, 0.45] },
    { duration: '0.8s', easing: 'easeOut' },
  );

  // Day counter
  if (vars.dayNumber) {
    $.wait('200ms');
    const dayLine = $.addText({
      text: `Day ${vars.dayNumber} together`,
      fontSize: 3,
      fontWeight: 400,
      color: '#ffffff',
      position: [0.5, 0.52],
      textAlign: 'center',
      opacity: 0,
    });
    dayLine.animate(
      { opacity: 0, position: [0.5, 0.54] },
      { opacity: 1, position: [0.5, 0.52] },
      { duration: '0.8s', easing: 'easeOut' },
    );
  }

  // Custom message
  $.wait('300ms');
  const msg = $.addText({
    text:
      vars.message ??
      `I hope your day is as wonderful as you are. — ${vars.companionName}`,
    fontSize: 2.8,
    fontWeight: 400,
    color: '#ffffff',
    position: [0.5, 0.62],
    textAlign: 'center',
    lineHeight: 1.4,
    opacity: 0,
  });
  msg.animate(
    { opacity: 0, position: [0.5, 0.65] },
    { opacity: 1, position: [0.5, 0.62] },
    { duration: '1s', easing: 'easeOut' },
  );

  $.wait('3s');

  // Exit animations
  msg.fadeOut('0.8s');
  greeting.fadeOut('0.8s');

  return $.compile();
}

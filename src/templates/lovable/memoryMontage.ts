import type { VideoJSON } from '@ilovevideoeditor/core';
import ILoveVideoEditor from '@ilovevideoeditor/core';

export interface MemoryMontageVariables {
  companionName: string;
  userName: string;
  occasion: string; // e.g. "1 month together"
  photos: string[]; // URLs
  backgroundMusic?: string;
  caption?: string;
}

export async function buildMemoryMontage(
  vars: MemoryMontageVariables,
): Promise<VideoJSON> {
  const $ = new ILoveVideoEditor({
    name: 'Memory Montage',
    width: 1080,
    height: 1920,
    fps: 30,
    backgroundColor: '#0f0f23',
  });

  // Opening title card
  const title = $.addText({
    text: `${vars.occasion}`,
    fontSize: 6,
    fontWeight: 800,
    color: '#ffffff',
    position: [0.5, 0.45],
    textAlign: 'center',
    opacity: 0,
  });
  title.animate(
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 },
    { duration: '1s' },
  );

  $.wait('1.5s');
  title.fadeOut('0.6s');

  // Photo sequence — each photo shown for 2s with Ken Burns effect
  for (let i = 0; i < vars.photos.length; i++) {
    const photo = $.addImage({ fit: 'cover' }, { source: vars.photos[i] });
    // Ken Burns: slow zoom in
    photo.animate(
      { scale: 1, opacity: 0 },
      { scale: 1.1, opacity: 1 },
      { duration: '2s', easing: 'easeOut' },
    );
    $.wait('2s');
    if (i < vars.photos.length - 1) {
      photo.fadeOut('0.4s');
    }
  }

  // Closing card
  $.wait('200ms');
  const closing = $.addText({
    text:
      vars.caption ??
      `Every moment with you is a memory I treasure. — ${vars.companionName}`,
    fontSize: 3.2,
    fontWeight: 600,
    color: '#ffffff',
    position: [0.5, 0.88],
    textAlign: 'center',
    lineHeight: 1.4,
    opacity: 0,
  });
  closing.animate({ opacity: 0 }, { opacity: 1 }, { duration: '1s' });

  $.wait('2.5s');
  closing.fadeOut('0.8s');

  return $.compile();
}

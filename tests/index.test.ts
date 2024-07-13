import { PGSRenderer } from '../src/index.ts';

test('PGSRenderer initializes with a video element', () => {
  const videoElement = document.createElement('video');
  const renderer = new PGSRenderer(videoElement);
  expect(renderer).toBeTruthy();
});

test('PGSRenderer loads and renders subtitles', async () => {
  const videoElement = document.createElement('video');
  document.body.appendChild(videoElement); // Ensure video element is in DOM

  const renderer = new PGSRenderer(videoElement);

  const subtitleFile = new ArrayBuffer(100); // Placeholder: Mock subtitle file
  const view = new DataView(subtitleFile);
  // Mock subtitle data: timestamp (4 bytes) + text length (1 byte) + text (n bytes)
  view.setUint32(0, 0, true); // Timestamp 0
  view.setUint8(4, 5); // Text length 5
  const text = 'Hello';
  for (let i = 0; i < text.length; i++) {
    view.setUint8(5 + i, text.charCodeAt(i));
  }

  await renderer.loadSubtitles(subtitleFile);

  const track = videoElement.textTracks[0];
  // Ensure track and track.cues are not null or undefined
  expect(track?.cues).not.toBeNull();
  expect(track?.cues).not.toBeUndefined();

  // If cues are present, validate the first cue
  if (track?.cues?.length) {
    const cue = track.cues[0] as VTTCue;
    expect(cue.text).toBe('Hello');
    expect(cue.startTime).toBe(0);
    expect(cue.endTime).toBe(5);
  } else {
    // Handle the case where no cues are present
    fail('No cues found in the text track.');
  }
});

// Cleanup after tests
afterEach(() => {
  document.body.innerHTML = '';
});

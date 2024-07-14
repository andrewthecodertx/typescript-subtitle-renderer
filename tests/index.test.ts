import { PGSRenderer } from '../src/index.ts';

// Mock ImageData for Node.js environment
global.ImageData = class {
  width: number;
  height: number;
  data: Uint8ClampedArray;

  constructor(sw: number, sh: number, settings?: ImageDataSettings);
  constructor(data: Uint8ClampedArray, sw: number, sh?: number, settings?: ImageDataSettings);
  constructor(arg1: number | Uint8ClampedArray, arg2: number, arg3?: number, settings?: ImageDataSettings) {
    if (typeof arg1 === 'number') {
      this.width = arg1;
      this.height = arg2;
      this.data = new Uint8ClampedArray(arg1 * arg2 * 4); // RGBA
    } else {
      this.data = arg1;
      this.width = arg2;
      this.height = arg3 ?? arg1.length / 4 / arg2;
    }
  }
};

// Helper function to create a mock ArrayBuffer of PGS subtitle data
function createMockSubtitleData(): ArrayBuffer {
  return new ArrayBuffer(100);
}

test('PGSRenderer initializes with a video element', () => {
  const mockVideoElement = document.createElement('video');
  const renderer = new PGSRenderer(mockVideoElement, { skipDOMCheck: true, videoWidth: 640, videoHeight: 360 });
  expect(renderer).toBeTruthy();
});

test('PGSRenderer loads and renders subtitles on canvas', async () => {
  const mockVideoElement = document.createElement('video');
  const renderer = new PGSRenderer(mockVideoElement, { skipDOMCheck: true, videoWidth: 640, videoHeight: 360 });

  const subtitleData = createMockSubtitleData();

  renderer['decodePGS'] = jest.fn().mockReturnValue([
    { timestamp: 0, imageData: new ImageData(1, 1) }, // Mock image data
  ]);

  await renderer.loadSubtitles(subtitleData);

  const canvas = renderer['canvas'];
  const ctx = renderer['ctx'];

  expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  expect(ctx).toBeInstanceOf(CanvasRenderingContext2D);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  expect(imageData.data.length).toBeGreaterThan(0);
});

afterEach(() => {
  document.body.innerHTML = '';
});

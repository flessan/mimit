import { isSolidColorSelected } from './utils/is-solid-color-selected.js';
import { MAX_SHADOW_BLUR_SIZE, MAX_STROKE_WIDTH, MAX_ROTATE } from './constants.js';

export class Canvas {
  #canvas = null;
  #ctx = null;
  #textBounds = [];

  constructor(canvasEl) {
    this.#canvas = canvasEl;
    this.#ctx = this.#canvas.getContext('2d');
  }

  get width() {
    return this.#canvas.width;
  }

  set width(value) {
    this.#canvas.width = value;
  }

  get height() {
    return this.#canvas.height;
  }

  set height(value) {
    this.#canvas.height = value;
  }

  getDimensions() {
    return {
      width: this.width,
      height: this.height
    };
  }

  setDimensions({ width, height }) {
    this.width = width;
    this.height = height;
    return this;
  }

  toDataURL(type = 'image/png', quality) {
    return this.#canvas.toDataURL(type, quality);
  }

  toBlob(type = 'image/png', quality) {
    return new Promise((resolve, reject) => {
      this.#canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('The browser could not encode this image format.'));
      }, type, quality);
    });
  }

  hitTest(x, y) {
    for (let index = this.#textBounds.length - 1; index >= 0; index -= 1) {
      const bounds = this.#textBounds[index];
      const dx = x - bounds.originX;
      const dy = y - bounds.originY;
      const cos = Math.cos(-bounds.rotation);
      const sin = Math.sin(-bounds.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      if (localX >= bounds.left && localX <= bounds.right &&
          localY >= bounds.top && localY <= bounds.bottom) {
        return bounds.id;
      }
    }
    return null;
  }

  draw(image, textboxes = new Map(), imageTransform = {}) {
    if (image == null) {
      return;
    }

    const canvas = this.#canvas;
    const ctx = this.#ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.#textBounds = [];

    if (isSolidColorSelected(image)) {
      ctx.fillStyle = image;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const scale = Math.max(1, Number(imageTransform.scale) || 1);
      const offsetX = Number(imageTransform.offsetX) || 0;
      const offsetY = Number(imageTransform.offsetY) || 0;
      const imageWidth = canvas.width * scale;
      const imageHeight = canvas.height * scale;
      const imageX = (canvas.width - imageWidth) / 2 + offsetX;
      const imageY = (canvas.height - imageHeight) / 2 + offsetY;

      // The canvas itself is the crop frame. The source can move and zoom,
      // but pixels outside the frame are never painted or exported.
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.clip();
      ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);
      ctx.restore();
    }

    let multiplier = 0;

    textboxes.forEach(textbox => {
      const { data } = textbox;

      multiplier += 1;

      ctx.save();

      ctx.font = `${data.fontWeight} ${(data.fontSize * canvas.width) / 1000}px ${data.font}`;
      ctx.textAlign = data.textAlign;
      ctx.strokeStyle = data.strokeColor;

      const xPos = canvas.width / 2;
      const shadowBlur = data.shadowBlur;
      const text = data.allCaps === true ? data.text.toUpperCase() : data.text;
      const textLines = text.split('\n').filter(line => line.trim() !== '');
      const textMetrics = ctx.measureText(textLines[0]);
      const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
      const bgOffset = data.textBackgroundEnabled ? textHeight / 4 : 0;
      const lineHeight = textHeight + data.fontSize / 4 + bgOffset;
      const lineWidths = textLines.map(line => ctx.measureText(line).width);
      const maxLineWidth = Math.max(0, ...lineWidths);
      const left = data.textAlign === 'left' ? 0 : data.textAlign === 'right' ? -maxLineWidth : -maxLineWidth / 2;
      const originX = xPos + data.offsetX;
      const originY = lineHeight * multiplier + data.offsetY;
      const rotation = (Math.min(data.rotate, MAX_ROTATE) * Math.PI) / 180;

      if (textLines.length && text.trim()) {
        this.#textBounds.push({
          id: data.id,
          originX,
          originY,
          left: left - bgOffset,
          right: left + maxLineWidth + bgOffset,
          top: -textMetrics.actualBoundingBoxAscent - bgOffset,
          bottom: (textLines.length - 1) * lineHeight + textMetrics.actualBoundingBoxDescent + bgOffset,
          rotation
        });
      }

      ctx.translate(originX, originY);
      ctx.rotate(rotation);

      if (data.textBackgroundEnabled) {
        ctx.fillStyle = data.textBackgroundColor;
        textLines.forEach((line, index) => {
          if (line) {
            const textMetrics = ctx.measureText(line);
            const textWidth = textMetrics.width;
            const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
            const xOffset = data.textAlign === 'left' ? 0 : data.textAlign === 'right' ? -textWidth : -textWidth / 2;

            ctx.fillRect(
              xOffset - bgOffset,
              index * lineHeight - textHeight - bgOffset,
              textWidth + bgOffset * 2,
              textHeight + bgOffset * 2
            );
          }
        });
      }

      ctx.save();
      if (shadowBlur !== 0) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = Math.min(shadowBlur, MAX_SHADOW_BLUR_SIZE);
        ctx.shadowColor = data.strokeColor;
      }
      ctx.fillStyle = data.fillColor;
      textLines.forEach((text, index) => ctx.fillText(text, 0, index * lineHeight));
      ctx.restore();

      if (data.strokeWidth > 0) {
        ctx.lineWidth = Math.min(data.strokeWidth, MAX_STROKE_WIDTH);
        textLines.forEach((text, index) => ctx.strokeText(text, 0, index * lineHeight));
      }

      ctx.restore();
    });

    return this;
  }

  clear() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    return this;
  }

  show() {
    this.#canvas.hidden = false;
    return this;
  }

  hide() {
    this.#canvas.hidden = true;
    return this;
  }

  static createInstance(canvasEl) {
    return new Canvas(canvasEl);
  }
}

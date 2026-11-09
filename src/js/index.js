import 'emoji-picker-element';
import insertTextAtCursor from 'insert-text-at-cursor';
import { CapturePhoto } from '@georapbox/capture-photo-element/dist/capture-photo-defined.js';
import { isWebShareSupported } from '@georapbox/web-share-element/dist/is-web-share-supported.js';
import '@georapbox/theme-toggle/dist/theme-toggle-defined.js';
import '@georapbox/web-share-element/dist/web-share-defined.js';
import '@georapbox/modal-element/dist/modal-element-defined.js';
import '@georapbox/files-dropzone-element/dist/files-dropzone-defined.js';
import '@georapbox/alert-element/dist/alert-element-defined.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import { ACCEPTED_MIME_TYPES } from './constants.js';
import { uid } from './utils/uid.js';
import { fileFromUrl } from './utils/file-from-url.js';
import { storage } from './utils/storage.js';
import { isSolidColorSelected } from './utils/is-solid-color-selected.js';
import { customFonts, loadCustomFont, registerCustomFont } from './custom-fonts.js';
import { Textbox } from './textbox.js';
import { Canvas } from './canvas.js';
import { toastify } from './toastify.js';

const canvasElement = document.getElementById('canvas');
const canvas = Canvas.createInstance(canvasElement);
const copyMemeBtn = document.getElementById('copyMemeBtn');
const exportFormatSelect = document.getElementById('exportFormatSelect');
const customFontInput = document.getElementById('customFontInput');
const addCustomFontBtn = document.getElementById('addCustomFontBtn');
const snapToGridInput = document.getElementById('snapToGrid');
const imageCropControls = document.getElementById('imageCropControls');
const toggleImageMoveBtn = document.getElementById('toggleImageMoveBtn');
const imageZoomInput = document.getElementById('imageZoom');
const imageZoomValue = document.getElementById('imageZoomValue');
const resetImageBtn = document.getElementById('resetImageBtn');
const videoModal = document.getElementById('videoModal');
const downloadModal = document.getElementById('downloadModal');
const capturePhotoEl = document.querySelector('capture-photo');
const cameraSelect = document.getElementById('cameraSelect');
const capturePhotoButton = document.getElementById('capturePhotoButton');
const torchButton = document.getElementById('torchButton');
const dropzoneEl = document.querySelector('files-dropzone');
const instructionsEl = document.getElementById('instructions');
const imageUploadMethodSelect = document.getElementById('imageUploadMethodSelect');
const fileSelectBtn = document.getElementById('fileSelectBtn');
const imageUrlForm = document.getElementById('imageUrlForm');
const addTextboxBtn = document.getElementById('addTextboxBtn');
const textboxesContainer = document.getElementById('textboxesContainer');
const generateMemeBtn = document.getElementById('generateMemeBtn');
const openVideoModalBtn = document.getElementById('openVideoModalBtn');
const downloadMemeBtn = document.getElementById('downloadMemeBtn');
const downloadMemePreview = document.getElementById('downloadMemePreview');
const webShareComponent = document.querySelector('web-share');
const galleryEl = document.getElementById('gallery');
const gallerySearchEl = document.getElementById('gallerySearch');
const galleryNoResultsEl = galleryEl.querySelector('.gallery__no-results');
const solidColorForm = document.getElementById('solidColorForm');
const uploadMethodEls = document.querySelectorAll('.upload-method');
const removeConfirmationModal = document.getElementById('removeConfirmationModal');
const removeTextForm = document.getElementById('removeTextForm');
const maxImageDimensionsForm = document.getElementById('maxImageDimensionsForm');
const maxImageDimensionsSelect = maxImageDimensionsForm['maxImageDimensions'];
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const maxImageDimensionsFromStorage = storage.get('maxImageDimensions');
let shouldFocusOnTextboxCreate = false;
let selectedImage = null;
let reqAnimFrame = null;
let exportObjectUrl = null;
let activeCanvasDrag = null;
let activeImageDrag = null;
let imageMoveMode = false;
const imageTransform = { scale: 1, offsetX: 0, offsetY: 0 };

document.addEventListener('web-share:error', handleWebShareError);
document.addEventListener('capture-photo:video-play', handleCapturePhotoVideoPlay, { once: true });
document.addEventListener('capture-photo:error', handleCapturePhotoError);
document.addEventListener('capture-photo:success', handleCapturePhotoSuccess);
document.addEventListener('modal-open', handleModalOpen);
document.addEventListener('modal-close', handleModalClose);
document.addEventListener('emoji-click', handleEmojiPickerSelection);
document.addEventListener('textbox-create', handleTextboxCreate);
document.addEventListener('textbox-remove', handleTextboxDelete);
fileSelectBtn.addEventListener('click', handleFileSelectClick);
openVideoModalBtn.addEventListener('click', handleOpenVideoModalButtonClick);
addTextboxBtn.addEventListener('click', handleAddTextboxBtnClick);
generateMemeBtn.addEventListener('click', generateMeme);
copyMemeBtn.addEventListener('click', handleCopyMeme);
exportFormatSelect.addEventListener('change', handleExportFormatChange);
addCustomFontBtn.addEventListener('click', () => customFontInput.click());
customFontInput.addEventListener('change', handleCustomFontUpload);
document.addEventListener('paste', handlePasteImage);
canvasElement.addEventListener('pointerdown', handleCanvasPointerDown);
canvasElement.addEventListener('pointermove', handleCanvasPointerMove);
canvasElement.addEventListener('pointerup', handleCanvasPointerUp);
canvasElement.addEventListener('pointercancel', handleCanvasPointerUp);
canvasElement.addEventListener('lostpointercapture', handleCanvasPointerUp);
toggleImageMoveBtn.addEventListener('click', handleToggleImageMove);
imageZoomInput.addEventListener('input', handleImageZoomInput);
resetImageBtn.addEventListener('click', handleResetImage);
downloadMemeBtn.addEventListener('click', () => (downloadModal.open = false));
imageUrlForm.addEventListener('submit', handleImageUploadFromURL);
dropzoneEl.addEventListener('files-dropzone-drop-accepted', handleDropFilesAccepted);
textboxesContainer.addEventListener('input', handleTextboxesContainerInput);
textboxesContainer.addEventListener('change', handleTextboxesContainerChange);
textboxesContainer.addEventListener('click', handleTextboxesContainerClick);
textboxesContainer.addEventListener('pointerdown', handleTextboxesContainerPointerdown);
textboxesContainer.addEventListener('pointerup', handleTextboxesContainerPointerup);
textboxesContainer.addEventListener('pointerout', handleTextboxesContainerPointerout);
textboxesContainer.addEventListener('keydown', handleTextboxesContainerKeyDown);
textboxesContainer.addEventListener('keyup', handleTextboxesContainerKeyUp);
imageUploadMethodSelect.addEventListener('change', handleUploadMethodChange);
galleryEl.addEventListener('click', handleGalleryClick);
gallerySearchEl.addEventListener('input', handleGallerySearchInput);
solidColorForm.addEventListener('input', handleSolidColorFormInput);
removeTextForm.addEventListener('submit', handleTextRemoveFormSubmit);
maxImageDimensionsForm.addEventListener('change', handleMaxImageDimensionsFormChange);
clearCanvasBtn.addEventListener('click', handleClearCanvas);
cameraSelect.addEventListener('change', handleCameraSelectChange);
capturePhotoButton.addEventListener('click', handleCapturePhotoButtonClick);
torchButton.addEventListener('click', handleTorchButtonClick);
window.addEventListener('beforeunload', handleBeforeunload);

galleryEl.querySelectorAll('button > img')?.forEach(image => {
  image.setAttribute('title', image.getAttribute('alt'));
});

Textbox.create();

dropzoneEl.accept = ACCEPTED_MIME_TYPES;

renderAcceptedImageFormats(ACCEPTED_MIME_TYPES, instructionsEl);

customFonts.forEach(({ name, path, style, weight }) => {
  loadCustomFont(name, path, { style, weight });
});

if (maxImageDimensionsFromStorage) {
  maxImageDimensionsSelect.value = maxImageDimensionsFromStorage;
}

maxImageDimensionsSelect.disabled = false;

function renderAcceptedImageFormats(acceptedMimeTypes, rootEl) {
  if (!rootEl) {
    return;
  }

  const extensions = acceptedMimeTypes.map(mimeType => mimeType.split('/')[1]);
  const str = `Supported image formats: ${extensions.join(', ')}`;
  const div = document.createElement('div');
  const small = document.createElement('small');

  small.textContent = str;
  div.appendChild(small);
  rootEl.appendChild(small);
}

async function generateMeme() {
  try {
    await refreshExportPreview();
    window.requestAnimationFrame(() => {
      downloadModal.open = true;
    });
  } catch (error) {
    toastify(`<strong>Export failed</strong><br><small>${error.message}</small>`, {
      trustDangerousInnerHTML: true,
      variant: 'danger',
      announce: 'alert'
    });
  }
}

async function refreshExportPreview() {
  const requestedType = exportFormatSelect.value || 'image/png';
  const quality = requestedType === 'image/jpeg' ? 0.92 : 0.95;
  const blob = await canvas.toBlob(requestedType, quality);
  const mimeType = blob.type || requestedType;
  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
  const filename = `${uid('meme')}.${extension}`;

  if (exportObjectUrl) URL.revokeObjectURL(exportObjectUrl);
  exportObjectUrl = URL.createObjectURL(blob);
  downloadMemeBtn.download = filename;
  downloadMemeBtn.href = exportObjectUrl;
  downloadMemePreview.width = canvas.getDimensions().width;
  downloadMemePreview.height = canvas.getDimensions().height;
  downloadMemePreview.src = exportObjectUrl;

  if (isWebShareSupported()) {
    const file = new File([blob], filename, { type: mimeType });
    if (isWebShareSupported({ files: [file] })) {
      webShareComponent.shareFiles = [file];
      webShareComponent.hidden = false;
    } else {
      webShareComponent.hidden = true;
    }
  } else {
    webShareComponent.hidden = true;
  }
  return blob;
}

async function handleCopyMeme() {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    toastify('Image clipboard access is not supported in this browser. Use HTTPS or download the image instead.', {
      variant: 'warning',
      announce: 'polite'
    });
    return;
  }

  try {
    const blob = await canvas.toBlob('image/png');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toastify('Image copied to clipboard.', { variant: 'success', announce: 'polite' });
  } catch (error) {
    toastify(`Could not copy image: ${error.message}`, { variant: 'danger', announce: 'alert' });
  }
}

async function handleExportFormatChange() {
  if (!selectedImage) return;
  try {
    await refreshExportPreview();
  } catch (error) {
    toastify(`Could not change export format: ${error.message}`, { variant: 'danger', announce: 'alert' });
  }
}

function renderCanvas() {
  if (!selectedImage) return;
  return canvas.draw(selectedImage, Textbox.getAll(), imageTransform);
}

function clampImageTransform() {
  const maxOffsetX = Math.max(0, (canvas.width * (imageTransform.scale - 1)) / 2);
  const maxOffsetY = Math.max(0, (canvas.height * (imageTransform.scale - 1)) / 2);

  imageTransform.offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, imageTransform.offsetX));
  imageTransform.offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, imageTransform.offsetY));
}

function resetImageTransform() {
  imageTransform.scale = 1;
  imageTransform.offsetX = 0;
  imageTransform.offsetY = 0;
  imageZoomInput.value = '1';
  updateImageZoomLabel();
  clampImageTransform();
}

function updateImageZoomLabel() {
  imageZoomValue.textContent = `${Math.round(imageTransform.scale * 100)}%`;
}

function updateImageMoveMode() {
  toggleImageMoveBtn.classList.toggle('active', imageMoveMode);
  toggleImageMoveBtn.setAttribute('aria-pressed', String(imageMoveMode));
  toggleImageMoveBtn.textContent = imageMoveMode ? 'Done positioning' : 'Move image';
  canvasElement.classList.toggle('is-image-move-mode', imageMoveMode);
  if (!activeImageDrag) {
    canvasElement.style.cursor = imageMoveMode ? 'grab' : 'default';
  }
}

function handleToggleImageMove() {
  if (!selectedImage || isSolidColorSelected(selectedImage)) return;
  imageMoveMode = !imageMoveMode;
  updateImageMoveMode();
}

function handleImageZoomInput() {
  if (!selectedImage || isSolidColorSelected(selectedImage)) return;
  imageTransform.scale = Math.max(1, Number(imageZoomInput.value) || 1);
  clampImageTransform();
  updateImageZoomLabel();
  renderCanvas();
}

function handleResetImage() {
  if (!selectedImage || isSolidColorSelected(selectedImage)) return;
  resetImageTransform();
  renderCanvas();
}

function setImageMaxDimensions(image) {
  const selectedSize = maxImageDimensionsForm['maxImageDimensions'].value;
  let width = image.width;
  let height = image.height;

  if (selectedSize !== 'original') {
    const [maxWidthValue, maxHeightValue] = selectedSize.split('x');
    const maxWidth = Number(maxWidthValue) || 800;
    const maxHeight = Number(maxHeightValue) || 600;
    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }
  canvas.setDimensions({ width, height });
  clampImageTransform();
}

function afterImageSelect() {
  const isImage = selectedImage && !isSolidColorSelected(selectedImage);
  imageCropControls.hidden = !isImage;
  if (!isImage) {
    imageMoveMode = false;
    updateImageMoveMode();
  }
  renderCanvas().show();
  dropzoneEl.classList.add('dropzone--accepted');
  dropzoneEl.disabled = true;
  generateMemeBtn.disabled = false;
  instructionsEl.hidden = true;
  clearCanvasBtn.hidden = false;
}

function handleImageLoad(evt) {
  selectedImage = evt.target;
  imageMoveMode = false;
  activeImageDrag = null;
  resetImageTransform();
  updateImageMoveMode();
  setImageMaxDimensions(selectedImage);
  afterImageSelect();
}

function handleSolidColorFormInput(evt) {
  const DEFAULT_WIDTH = 800;
  const DEFAULT_HEIGHT = 600;

  if (evt.target === solidColorForm['canvasColor']) {
    selectedImage = evt.target.value;
  }

  if (isSolidColorSelected(selectedImage)) {
    canvas.setDimensions({
      width: Number(solidColorForm['canvasWidth'].value) || DEFAULT_WIDTH,
      height: Number(solidColorForm['canvasHeight'].value) || DEFAULT_HEIGHT
    });

    afterImageSelect();
  }
}

function handleFileSelect(file) {
  if (!file) {
    return;
  }

  const image = new Image();
  const reader = new FileReader();

  reader.addEventListener('load', function (evt) {
    const data = evt.target.result;
    image.addEventListener('load', handleImageLoad);
    image.src = data;
  });

  reader.readAsDataURL(file);
}

function handlePasteImage(evt) {
  const imageItem = Array.from(evt.clipboardData?.items || []).find(item => item.type.startsWith('image/'));
  const file = imageItem?.getAsFile();
  if (!file) return;

  evt.preventDefault();
  const pastedFile = file.name
    ? file
    : new File([file], `pasted-image.${file.type.split('/')[1] || 'png'}`, { type: file.type });
  handleFileSelect(pastedFile);
}

function handleCanvasPointerDown(evt) {
  if (!selectedImage || evt.button !== 0) return;
  const rect = canvasElement.getBoundingClientRect();
  const point = {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height)
  };

  if (imageMoveMode && !isSolidColorSelected(selectedImage)) {
    activeImageDrag = {
      pointerId: evt.pointerId,
      startX: point.x,
      startY: point.y,
      offsetX: imageTransform.offsetX,
      offsetY: imageTransform.offsetY
    };
    canvasElement.setPointerCapture(evt.pointerId);
    canvasElement.classList.add('is-image-dragging');
    evt.preventDefault();
    return;
  }

  const textboxId = canvas.hitTest(point.x, point.y);
  const textbox = textboxId && Textbox.getById(textboxId);
  if (!textbox) return;

  const data = textbox.getData();
  activeCanvasDrag = {
    pointerId: evt.pointerId,
    textboxId,
    startX: point.x,
    startY: point.y,
    offsetX: data.offsetX,
    offsetY: data.offsetY
  };
  canvasElement.setPointerCapture(evt.pointerId);
  canvasElement.classList.add('is-dragging');
  evt.preventDefault();
}

function handleCanvasPointerMove(evt) {
  const rect = canvasElement.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const point = {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height)
  };

  if (activeImageDrag) {
    imageTransform.offsetX = activeImageDrag.offsetX + point.x - activeImageDrag.startX;
    imageTransform.offsetY = activeImageDrag.offsetY + point.y - activeImageDrag.startY;
    clampImageTransform();
    renderCanvas();
    return;
  }

  if (!activeCanvasDrag) {
    canvasElement.style.cursor = imageMoveMode
      ? 'grab'
      : canvas.hitTest(point.x, point.y) ? 'grab' : 'default';
    return;
  }

  const textbox = Textbox.getById(activeCanvasDrag.textboxId);
  if (!textbox) return;
  const snap = snapToGridInput.checked ? 10 : 1;
  const data = textbox.getData();
  data.offsetX = Math.round((activeCanvasDrag.offsetX + point.x - activeCanvasDrag.startX) / snap) * snap;
  data.offsetY = Math.round((activeCanvasDrag.offsetY + point.y - activeCanvasDrag.startY) / snap) * snap;

  const textboxEl = document.getElementById(activeCanvasDrag.textboxId);
  const offsetXInput = textboxEl?.querySelector('[data-input="offsetX"]');
  const offsetYInput = textboxEl?.querySelector('[data-input="offsetY"]');
  if (offsetXInput) offsetXInput.value = data.offsetX;
  if (offsetYInput) offsetYInput.value = data.offsetY;
  renderCanvas();
}

function handleCanvasPointerUp(evt) {
  const activeDrag = activeImageDrag || activeCanvasDrag;
  if (!activeDrag || (evt.pointerId !== undefined && evt.pointerId !== activeDrag.pointerId)) return;

  activeImageDrag = null;
  activeCanvasDrag = null;
  canvasElement.classList.remove('is-dragging', 'is-image-dragging');
  canvasElement.style.cursor = imageMoveMode ? 'grab' : 'default';
}

async function handleCustomFontUpload(evt) {
  const [file] = evt.target.files || [];
  if (!file) return;
  try {
    const font = await registerCustomFont(file);
    textboxesContainer.querySelectorAll('[data-input="font"]').forEach(select => {
      let group = select.querySelector('[data-uploaded-fonts]');
      if (!group) {
        group = document.createElement('optgroup');
        group.label = 'Uploaded fonts';
        group.dataset.uploadedFonts = '';
        select.appendChild(group);
      }
      group.appendChild(new Option(font.label, font.name));
    });
    toastify(`Font “${font.label}” added for this session.`, { variant: 'success', announce: 'polite' });
  } catch (error) {
    toastify(`Could not load font: ${error.message}`, { variant: 'danger', announce: 'alert' });
  } finally {
    customFontInput.value = '';
  }
}

function handleOpenVideoModalButtonClick() {
  videoModal.open = true;
}

function handleTextPropChange(element, textboxId, prop) {
  const textboxData = Textbox.getById(textboxId).getData();

  switch (element.type) {
    case 'checkbox':
      textboxData[prop] = element.checked;
      break;
    case 'number':
      textboxData[prop] = Number(element.value);
      break;
    default:
      textboxData[prop] = element.value;
  }

  renderCanvas();
}

function handleAddTextboxBtnClick() {
  return Textbox.create();
}

async function handleImageUploadFromURL(evt) {
  evt.preventDefault();

  const form = evt.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const imageUrl = form['imageUrl'].value;
  const errorMessage = `<strong>Error loading image</strong><br><small class="d-block text-truncate">Failed to fetch image from ${imageUrl || ''}.</small>`;

  if (!imageUrl.trim()) {
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector('.spinner').hidden = false;
  submitButton.querySelector('.label').hidden = true;

  try {
    const file = await fileFromUrl({
      url: imageUrl
    }).catch(() => {
      toastify(errorMessage, {
        trustDangerousInnerHTML: true,
        variant: 'danger',
        announce: 'alert'
      });
    });

    if (file) {
      handleFileSelect(file);
    }
  } catch {
    toastify(errorMessage, {
      trustDangerousInnerHTML: true,
      variant: 'danger',
      announce: 'alert'
    });
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector('.spinner').hidden = true;
    submitButton.querySelector('.label').hidden = false;
  }
}

function moveTextUsingArrowbuttons(textboxId, direction) {
  return function () {
    const textboxEl = document.getElementById(textboxId);
    const offsetYInput = textboxEl.querySelector('[data-input="offsetY"]');
    const offsetXInput = textboxEl.querySelector('[data-input="offsetX"]');
    const textbox = Textbox.getById(textboxId);

    if (!textbox) {
      return;
    }

    const textboxData = textbox.getData();

    direction = direction.toLowerCase();

    switch (direction) {
      case 'up':
        textboxData.offsetY -= 1;
        offsetYInput.value = textboxData.offsetY;
        break;
      case 'down':
        textboxData.offsetY += 1;
        offsetYInput.value = textboxData.offsetY;
        break;
      case 'left':
        textboxData.offsetX -= 1;
        offsetXInput.value = textboxData.offsetX;
        break;
      case 'right':
        textboxData.offsetX += 1;
        offsetXInput.value = textboxData.offsetX;
        break;
    }

    renderCanvas();

    reqAnimFrame = requestAnimationFrame(moveTextUsingArrowbuttons(textboxId, direction));
  };
}

function handleUploadMethodChange(evt) {
  uploadMethodEls.forEach(el => (el.hidden = el.id !== evt.target.value));
  maxImageDimensionsForm.hidden = evt.target.value === 'solidColorForm';
}

function handleFileSelectClick() {
  if (typeof dropzoneEl.openFileDialog === 'function') {
    // NOTE: Always enable dropzone before opening dialog
    // in case it was previously disabled after image selection.
    dropzoneEl.disabled = false;
    dropzoneEl.openFileDialog();
  }
}

function handleDropFilesAccepted(evt) {
  const [file] = evt.detail.acceptedFiles;

  if (file) {
    handleFileSelect(file);
  }
}

function handleTextboxesContainerInput(evt) {
  const inputMap = {
    text: 'text',
    fillColor: 'fillColor',
    strokeColor: 'strokeColor',
    font: 'font',
    fontSize: 'fontSize',
    fontWeight: 'fontWeight',
    textAlign: 'textAlign',
    shadowBlur: 'shadowBlur',
    offsetY: 'offsetY',
    offsetX: 'offsetX',
    rotate: 'rotate',
    strokeWidth: 'strokeWidth',
    textBackgroundEnabled: 'textBackgroundEnabled',
    textBackgroundColor: 'textBackgroundColor'
  };
  const element = evt.target;
  const prop = inputMap[element.dataset.input];

  if (!prop) {
    return;
  }

  const textboxId = element.closest('[data-section="textbox"]').id;
  handleTextPropChange(element, textboxId, prop);
}

function handleTextboxesContainerChange(evt) {
  const element = evt.target;
  const textboxId = element.closest('[data-section="textbox"]').id;
  let prop;

  if (element.matches('[data-input="allCaps"]')) {
    prop = 'allCaps';
  }

  if (prop) {
    handleTextPropChange(element, textboxId, prop);
  }
}

function handleTextboxesContainerClick(evt) {
  const element = evt.target;

  if (element.matches('[data-button="settings"]')) {
    const textboxEl = element.closest('[data-section="textbox"]');
    const textboxSettingsEl = textboxEl?.querySelector('[data-section="advanced-settings"]');

    if (textboxSettingsEl) {
      textboxSettingsEl.hidden = !textboxSettingsEl.hidden;
    }
  }

  if (element.matches('[data-button="duplicate-text-box"')) {
    const currentTextboxEl = element.closest('[data-section="textbox"]');
    const currentTextboxData = Textbox.getById(currentTextboxEl.id);
    Textbox.create({ ...currentTextboxData.data });
  }

  if (element.matches('[data-button="delete-text-box"]')) {
    const textboxId = element.closest('[data-section="textbox"]').id;
    const textboxToDelete = Textbox.getById(textboxId);

    if (textboxToDelete && textboxToDelete.data.text.trim()) {
      const textboxIdInput = removeTextForm['textbox-id'];

      if (textboxIdInput) {
        textboxIdInput.value = textboxId;
        removeConfirmationModal.open = true;
      }
    } else {
      Textbox.remove(textboxId);
    }
  }
}

function handleTextRemoveFormSubmit(evt) {
  evt.preventDefault();
  const textboxId = evt.target['textbox-id'].value;

  if (textboxId) {
    Textbox.remove(textboxId);
    removeConfirmationModal.open = false;
  }
}

function handleTextboxesContainerPointerdown(evt) {
  const element = evt.target;
  const textboxEl = element.closest('[data-section="textbox"]');

  if (!textboxEl) {
    return;
  }

  if (element.matches('[data-action="move-text"]')) {
    reqAnimFrame = requestAnimationFrame(moveTextUsingArrowbuttons(textboxEl.id, element.getAttribute('aria-label')));
  }
}

function handleTextboxesContainerPointerup(evt) {
  const element = evt.target;

  if (element.matches('[data-action="move-text"]')) {
    cancelAnimationFrame?.(reqAnimFrame);
    reqAnimFrame = null;
  }
}

function handleTextboxesContainerPointerout(evt) {
  const element = evt.target;

  if (element.matches('[data-action="move-text"]')) {
    cancelAnimationFrame?.(reqAnimFrame);
    reqAnimFrame = null;
  }
}

function handleTextboxesContainerKeyDown(evt) {
  const element = evt.target;
  const textboxEl = element.closest('[data-section="textbox"]');

  if (element.matches('[data-action="move-text"]')) {
    if (evt.key === ' ' || evt.key === 'Enter') {
      if (reqAnimFrame) {
        cancelAnimationFrame(reqAnimFrame);
      }
      reqAnimFrame = requestAnimationFrame(moveTextUsingArrowbuttons(textboxEl.id, element.getAttribute('aria-label')));
    }
  }
}

function handleTextboxesContainerKeyUp(evt) {
  const element = evt.target;

  if (element.matches('[data-action="move-text"]')) {
    if (evt.key === ' ' || evt.key === 'Enter') {
      if (reqAnimFrame) {
        cancelAnimationFrame(reqAnimFrame);
      }
      reqAnimFrame = null;
    }
  }
}

async function handleGalleryClick(evt) {
  const button = evt.target.closest('button');

  if (!button) {
    return;
  }

  const img = button.querySelector('img');
  const errorMessage = `<strong>Error loading image</strong><br><small>Failed to load image: "${img.alt || ''}".</small>`;

  try {
    const file = await fileFromUrl({
      url: img.src
    }).catch(() => {
      toastify(errorMessage, {
        trustDangerousInnerHTML: true,
        variant: 'danger',
        announce: 'alert'
      });
    });

    if (file) {
      handleFileSelect(file);
    }
  } catch {
    toastify(errorMessage, {
      trustDangerousInnerHTML: true,
      variant: 'danger',
      announce: 'alert'
    });
  }
}

function handleGallerySearchInput(evt) {
  const query = evt.target.value.toLowerCase().trim();
  const galleryItems = galleryEl.querySelectorAll('button');

  galleryItems.forEach(item => {
    const alt = (item.querySelector('img').getAttribute('alt') || '').toLowerCase();
    item.hidden = !alt.includes(query);
  });

  galleryNoResultsEl.hidden = !!galleryEl.querySelector('button:not([hidden])');
}

function handleWebShareError() {
  downloadModal.open = false;
  toastify('<strong>Error sharing</strong><br><small>There was an error while trying to share your meme.</small>', {
    trustDangerousInnerHTML: true,
    variant: 'danger',
    announce: 'alert'
  });
}

function handleCapturePhotoError(evt) {
  const error = evt.detail.error;
  let errorMessage = 'An error occurred while trying to capture photo.';

  if (error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'NotFoundError')) {
    errorMessage += ' Make sure you have a camera connected and you have granted the appropriate permissions.';
  }

  toastify(`<strong>Error capturing photo</strong><br><small>${errorMessage}</small>`, {
    trustDangerousInnerHTML: true,
    variant: 'danger',
    announce: 'alert'
  });

  videoModal.open = false;
  console.error(error);
}

function handleCapturePhotoSuccess(evt) {
  videoModal.open = false;
  const image = new Image();
  image.addEventListener('load', handleImageLoad);
  image.src = evt.detail.dataURI;
}

function handleModalOpen(evt) {
  if (evt.target.id === 'videoModal') {
    if (capturePhotoEl && typeof capturePhotoEl.startVideoStream === 'function') {
      capturePhotoEl.startVideoStream();
    }
  }
}

function handleModalClose(evt) {
  if (evt.target.id === 'videoModal') {
    if (capturePhotoEl && typeof capturePhotoEl.stopVideoStream === 'function') {
      capturePhotoEl.stopVideoStream();
    }
  }

  if (evt.target.id === 'removeConfirmationModal') {
    removeTextForm.reset();
  }
}

function handleEmojiPickerSelection(evt) {
  const textboxEl = evt.target.closest('[data-section="textbox"]');

  if (textboxEl) {
    const input = textboxEl.querySelector('[data-input="text"]');
    const emoji = evt.detail.unicode;

    if (input) {
      insertTextAtCursor(input, emoji);
    }
  }
}

function handleMaxImageDimensionsFormChange(evt) {
  if (evt.target.matches('[name="maxImageDimensions"]')) {
    storage.set('maxImageDimensions', evt.target.value);
  }

  if (!selectedImage || isSolidColorSelected(selectedImage)) {
    return;
  }

  setImageMaxDimensions(selectedImage);
  renderCanvas();
}

function handleTextboxCreate(evt) {
  const textbox = evt.detail.textbox;
  const textboxEl = Textbox.createElement(textbox, shouldFocusOnTextboxCreate);

  shouldFocusOnTextboxCreate = true;
  textboxesContainer.appendChild(textboxEl);

  if (textbox.getData().text) {
    renderCanvas();
  }
}

function handleTextboxDelete(evt) {
  const textboxEl = document.getElementById(evt.detail.id);
  textboxEl?.remove();

  textboxesContainer.querySelectorAll('[data-section="textbox"]').forEach((el, idx) => {
    el.querySelector('[data-input="text"]').setAttribute('placeholder', `Text #${idx + 1}`);
  });

  renderCanvas();
}

function handleClearCanvas(evt) {
  if (!selectedImage) {
    return;
  }

  evt.stopPropagation();
  selectedImage = null;
  imageCropControls.hidden = true;
  imageMoveMode = false;
  activeImageDrag = null;
  resetImageTransform();
  updateImageMoveMode();
  dropzoneEl.classList.remove('dropzone--accepted');
  generateMemeBtn.disabled = true;
  instructionsEl.hidden = false;
  clearCanvasBtn.hidden = true;
  dropzoneEl.disabled = false;
  canvas.clear().hide();
}

function toggleTorchButtonStatus(options = {}) {
  const defaults = {
    el: document.getElementById('torchButton'),
    isTorchOn: false
  };
  const { el, isTorchOn } = { ...defaults, ...options };
  const iconPaths = el.querySelectorAll('svg path');

  if (iconPaths.length !== 2) {
    return;
  }

  iconPaths[0].style.display = isTorchOn ? 'none' : 'block';
  iconPaths[1].style.display = isTorchOn ? 'block' : 'none';
  el.setAttribute('aria-label', `Turn ${isTorchOn ? 'off' : 'on'} flash`);
}

function handleTorchButtonClick(evt) {
  if (capturePhotoEl === null) {
    return;
  }

  capturePhotoEl.torch = !capturePhotoEl.torch;

  toggleTorchButtonStatus({
    el: evt.currentTarget,
    isTorchOn: capturePhotoEl.hasAttribute('torch')
  });
}

async function handleCapturePhotoVideoPlay(evt) {
  const trackCapabilities = evt.target.getTrackCapabilities();

  if (trackCapabilities?.torch) {
    torchButton?.removeAttribute('hidden');

    if (capturePhotoEl?.hasAttribute('torch')) {
      toggleTorchButtonStatus({ el: torchButton, isTorchOn: true });
    }
  }

  const videoInputDevices = await CapturePhoto.getVideoInputDevices();

  videoInputDevices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `Camera ${index + 1}`;
    cameraSelect.appendChild(option);
  });

  if (videoInputDevices.length > 1) {
    cameraSelect?.removeAttribute('hidden');
  }
}

function handleCameraSelectChange(evt) {
  if (
    capturePhotoEl === null ||
    typeof capturePhotoEl.restartVideoStream !== 'function' ||
    capturePhotoEl.hasAttribute('loading')
  ) {
    return;
  }

  const videoDeviceId = evt.target.value || undefined;
  capturePhotoEl.restartVideoStream(videoDeviceId);
}

function handleCapturePhotoButtonClick() {
  if (
    capturePhotoEl === null ||
    typeof capturePhotoEl.capture !== 'function' ||
    capturePhotoEl.hasAttribute('loading')
  ) {
    return;
  }

  capturePhotoEl.capture();
}

function handleBeforeunload(evt) {
  if (changesHaveOccurred()) {
    evt.preventDefault();
    evt.returnValue = true; // Included for legacy support, e.g. Chrome/Edge < 119
  }
}

function changesHaveOccurred() {
  let hasChanges = selectedImage !== null;

  for (const v of Textbox.getAll().values()) {
    if (!Textbox.hasDefaultValues(v.data)) {
      hasChanges = true;
      break;
    }
  }

  return hasChanges;
}

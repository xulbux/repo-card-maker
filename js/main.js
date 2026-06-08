const initRepoName = 'Repo Card Maker';
const initRepoDesc = 'A simple tool to create GitHub repository social preview images with a beautiful glowing card design.';
const initAccentColor = '#EF4444';
// RESTORED ORIGINAL FILL COLOR TO DEFAULT SVG
const initIcon = 'data:image/svg+xml;base64,PHN2ZyBpZD0icmVwby1jYXJkLW1ha2VyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIj4KICA8cGF0aCBmaWxsPSIjZWY0NDQ0IiBkPSJNNDU1LjExLDU2Ljg5SDU2Ljg5QzI1LjUxLDU2Ljg5LDAsODIuNCwwLDExMy43OHYyODQuNDRjMCwzMS4zOCwyNS41MSw1Ni44OSw1Ni44OSw1Ni44OWgzOTguMjJjMzEuMzgsMCw1Ni44OS0yNS41MSw1Ni44OS01Ni44OVYxMTMuNzhjMC0zMS4zOC0yNS41MSw1Ni44OS01Ni44OS01Ni44OVZNNzQuNjcsMTU0LjY3aDk5LjU2YzExLjgyLDAsMjEuMzMsOS41MSwyMS4zMywyMS4zM3MtOS41MSwyMS4zMy0yMS4zMywyMS4zM2gtOTkuNTZjLTExLjgyLDAtMjEuMzMtOS41MS0yMS4zMy0yMS4zM3M5LjUxLTIxLjMzLDIxLjMzLTIxLjMzWk03NC42NywyMzEuMTFoMTI2LjIyYzExLjgyLDAsMjEuMzMsOS41MSwyMS4zMywyMS4zM3MtOS41MSwyMS4zMy0yMS4zMywyMS4zM2gtMTI2LjIyYy0xMS44MiwwLTIxLjMzLTkuNTEtMjEuMzMtMjEuMzNzOS41MS0yMS4zMywyMS4zMy0yMS4zM1pNMTE3LjMzLDQwMS43OGgtNDIuNjdjLTExLjgyLDAtMjEuMzMtOS41MS0yMS4zMy0yMS4zM3M5LjUxLTIxLjMzLDIxLjMzLTIxLjMzSDExNy4zM2MxMS44MiwwLDIxLjMzLDkuNTEsMjEuMzMsMjEuMzNzLTkuNTEsMjEuMzMtMjEuMzMsMjEuMzNaTTI4Ni4yMiw0MDEuNzhoLTgzLjU2Yy0xMS44MiwwLTIxLjMzLTkuNTEtMjEuMzMtMjEuMzNzOS41MS0yMS4zMywyMS4zMy0yMS4zM2g4My41NmMxMS44MiwwLDIxLjMzLDkuNTEsMjEuMzMsMjEuMzNzLTkuNTEsMjEuMzMtMjEuMzMsMjEuMzNaTTQzNy4zMyw0MDEuNzhoLTY1Ljc4Yy0xMS44MiwwLTIxLjMzLTkuNTEtMjEuMzMtMjEuMzNzOS41MS0yMS4zMywyMS4zMy0yMS4zM2g2NS43OGMxMS44MiwwLDIxLjMzLDkuNTEsMjEuMzMsMjEuMzNzLTkuNTEsMjEuMzMtMjEuMzMsMjEuMzNaTTQ1NS4zMiwyMDkuODhsLTMzLjc0LDU4Ljk2Yy00LjQ5LDcuODYtMTIuODcsMTIuNjktMjEuOTIsMTIuNjloLTY3LjIxYy05LjA1LDAtMTcuNDMtNC44NC0yMS45Mi0xMi42OWwtMzMuNzQtNTguOTZjLTQuNDUtNy43NS00LjQ1LTE3LjI5LDAtMjUuMDhsMzMuNzQtNTguOTZjNC40OS03Ljg2LDEyLjg3LTEyLjY5LDIxLjkyLTEyLjY5aDY3LjIxYzkuMDUsMCwxNy40Myw0Ljg0LDIxLjkyLDEyLjY5bDMzLjc0LDU4Ljk2YzQuNDUsNy43NSw0LjQ1LTE3LjI5LDAtMjUuMDhoMFoiLz4KPC9zdmc+';

const inputGithubUrl = document.getElementById('input-github-url');
const fetchBtn = document.getElementById('fetch-btn');
const inputRepoName = document.getElementById('input-repo-name');
const inputRepoDesc = document.getElementById('input-repo-desc');
const inputRepoIcon = document.getElementById('input-repo-icon');
const inputTintIcon = document.getElementById('input-tint-icon');
const inputProminentIcon = document.getElementById('input-prominent-icon');
const inputAccentColor = document.getElementById('input-accent-color');

const previewCard = document.getElementById('preview-card');
const previewRepoName = document.getElementById('preview-repo-name');
const previewRepoIcon = document.getElementById('preview-repo-icon');
const previewRepoDesc = document.getElementById('preview-repo-desc');

let currentRepoIcon = null;

/**
 * Converts Hex to HSL
 */
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL to Hex
 */
function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Constrains a hex color to be vibrant (mid-to-high lightness)
 */
function getVibrantColor(hex) {
  const hsl = hexToHsl(hex);
  const l = Math.max(50, hsl.l);
  return hslToHex(hsl.h, hsl.s, l);
}

function setInitValues() {
  inputRepoName.value = initRepoName;
  inputRepoDesc.value = initRepoDesc;
  inputAccentColor.value = initAccentColor;

  syncPreview();
  updateAccentColor();

  // SET DEFAULT ICON DATA URL
  currentRepoIcon = initIcon;
  updateIconStyle();
  updateLayout();
}

function syncPreview() {
  previewRepoName.textContent = inputRepoName.value || 'Repo Name';
  previewRepoDesc.textContent = inputRepoDesc.value || 'Repo Description goes here.';
}

function updateAccentColor() {
  const rawColor = inputAccentColor.value;
  const vibrantColor = getVibrantColor(rawColor);
  document.documentElement.style.setProperty('--color-accent-500', vibrantColor);
}

/**
 * Applies tinting and layout style
 */
function updateIconStyle() {
  if (!currentRepoIcon) return;

  if (inputTintIcon.checked) {
    previewRepoIcon.classList.add('tinted');
    previewRepoIcon.style.backgroundImage = 'none';
    previewRepoIcon.style.webkitMaskImage = `url(${currentRepoIcon})`;
    previewRepoIcon.style.maskImage = `url(${currentRepoIcon})`;
  } else {
    previewRepoIcon.classList.remove('tinted');
    // CSS OVERRIDE TO ENSURE MASK IS REMOVED
    previewRepoIcon.style.setProperty('-webkit-mask-image', 'none', 'important');
    previewRepoIcon.style.setProperty('mask-image', 'none', 'important');
    previewRepoIcon.style.backgroundImage = `url(${currentRepoIcon})`;
  }
}

function updateLayout() {
  if (inputProminentIcon.checked) {
    previewCard.classList.add('prominent-icon');
  } else {
    previewCard.classList.remove('prominent-icon');
  }
}

// HANDLE GITHUB FETCH
fetchBtn.addEventListener('click', async () => {
  const input = inputGithubUrl.value.trim();
  if (!input) return;

  let owner, repo;
  const urlMatch = input.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    owner = urlMatch[1];
    repo = urlMatch[2].replace(/\.git$/, '');
  } else {
    const shorthandMatch = input.match(/^([^/]+)\/([^/]+)$/);
    if (shorthandMatch) {
      owner = shorthandMatch[1];
      repo = shorthandMatch[2];
    } else {
      alert('Please enter a valid GitHub repository URL or shorthand (owner/repo).');
      return;
    }
  }

  fetchBtn.disabled = true;
  fetchBtn.textContent = 'Fetching...';

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!response.ok) throw new Error('Repository not found');

    const data = await response.json();
    inputRepoName.value = data.name;
    inputRepoDesc.value = data.description || '';
    syncPreview();
  } catch (err) {
    alert('Failed to fetch repository details. Please check the input or try again.');
    console.error(err);
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = 'Fetch Details';
  }
});

// INPUT LISTENERS
inputRepoName.addEventListener('input', syncPreview);
inputRepoDesc.addEventListener('input', syncPreview);
inputAccentColor.addEventListener('input', updateAccentColor);
inputTintIcon.addEventListener('change', updateIconStyle);
inputProminentIcon.addEventListener('change', updateLayout);

// HANDLE REPO ICON UPLOAD
inputRepoIcon.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentRepoIcon = event.target.result;
      updateIconStyle();
    };
    reader.readAsDataURL(file);
  }
});

// EXPORT FUNCTIONALITY
const dlBtn = document.getElementById('dl-btn');
dlBtn.addEventListener('click', () => {
  const vibrantColor = getVibrantColor(inputAccentColor.value);
  exportBanner(
    vibrantColor,
    currentRepoIcon,
    inputRepoName.value,
    inputRepoDesc.value,
    inputTintIcon.checked,
    inputProminentIcon.checked
  );
});

setInitValues();

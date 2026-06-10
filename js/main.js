const initRepoName = 'Repo Card Maker';
const initRepoDesc = 'A simple tool to create GitHub repo social preview images with a beautiful glowing card design.';
const initAccentColor = '#615fff';
const initIcon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='white' d='M455.11,56.89H56.89C25.51,56.89,0,82.4,0,113.78v284.44c0,31.38,25.51,56.89,56.89,56.89h398.22c31.38,0,56.89-25.51,56.89-56.89V113.78c0-31.38-25.51-56.89-56.89-56.89ZM74.67,154.67h99.56c11.82,0,21.33,9.51,21.33,21.33s-9.51,21.33-21.33,21.33h-99.56c-11.82,0-21.33-9.51-21.33-21.33s9.51-21.33,21.33-21.33ZM74.67,231.11h126.22c11.82,0,21.33,9.51,21.33,21.33s-9.51,21.33-21.33,21.33h-126.22c-11.82,0-21.33-9.51-21.33-21.33s9.51-21.33,21.33-21.33ZM117.33,401.78h-42.67c-11.82,0-21.33-9.51-21.33-21.33s9.51-21.33,21.33-21.33h42.67c11.82,0,21.33,9.51,21.33,21.33s-9.51,21.33-21.33,21.33ZM286.22,401.78h-83.56c-11.82,0-21.33-9.51-21.33-21.33s9.51-21.33,21.33-21.33h83.56c11.82,0,21.33,9.51,21.33,21.33s-9.51,21.33-21.33,21.33ZM437.33,401.78h-65.78c-11.82,0-21.33-9.51-21.33-21.33s9.51-21.33,21.33-21.33h65.78c11.82,0,21.33,9.51,21.33,21.33s-9.51,21.33-21.33,21.33ZM455.32,209.88l-33.74,58.96c-4.49,7.86-12.87,12.69-21.92,12.69h-67.21c-9.05,0-17.43-4.84-21.92-12.69l-33.74-58.96c-4.45-7.75-4.45-17.29,0-25.08l33.74-58.96c4.49-7.86,12.87-12.69,21.92-12.69h67.21c9.05,0,17.43,4.84,21.92,12.69l33.74,58.96c4.45,7.75,4.45,17.29,0,25.08h0Z'/></svg>`;

const inputGithubUrl = document.getElementById('input-github-url');
const fetchBtn = document.getElementById('fetch-btn');
const inputRepoName = document.getElementById('input-repo-name');
const inputRepoDesc = document.getElementById('input-repo-desc');
const inputRepoIcon = document.getElementById('input-repo-icon');
const inputTintIcon = document.getElementById('input-tint-icon');
const inputAccentColor = document.getElementById('input-accent-color');

const previewCard = document.getElementById('preview-card');
const previewRepoName = document.getElementById('preview-repo-name');
const previewRepoIcon = document.getElementById('preview-repo-icon');
const previewRepoDesc = document.getElementById('preview-repo-desc');
const repoCardPreview = document.getElementById('repo-card-preview');

let currentRepoIcon = null;
let fetchedRepoSlug = null;

// Scale the fixed-size card to fit its container, like an image
new ResizeObserver(() => {
  previewCard.style.setProperty('--card-scale', (repoCardPreview.clientWidth - 80) / 1120);
}).observe(repoCardPreview);

function setInitValues() {
  inputRepoName.value = initRepoName;
  inputRepoDesc.value = initRepoDesc;
  inputAccentColor.value = initAccentColor;

  syncPreview();
  updateAccentColor();

  currentRepoIcon = initIcon || null;
  updateIconStyle();
}

function syncPreview() {
  previewRepoName.textContent = inputRepoName.value || 'Repo Name';
  previewRepoDesc.textContent = inputRepoDesc.value || 'Repo Description goes here.';
}

function updateAccentColor() {
  const rawColor = inputAccentColor.value;
  const vibrantColor = getVibrantColor(rawColor);
  document.documentElement.style.setProperty('--color-accent', vibrantColor);
}

function updateIconStyle() {
  if (!currentRepoIcon) return;

  if (inputTintIcon.checked) {
    previewRepoIcon.classList.add('tinted');
    previewRepoIcon.style.backgroundImage = 'none';
    previewRepoIcon.style.webkitMaskImage = `url("${currentRepoIcon}")`;
    previewRepoIcon.style.maskImage = `url("${currentRepoIcon}")`;
  } else {
    previewRepoIcon.classList.remove('tinted');
    previewRepoIcon.style.setProperty('-webkit-mask-image', 'none', 'important');
    previewRepoIcon.style.setProperty('mask-image', 'none', 'important');
    previewRepoIcon.style.backgroundImage = `url("${currentRepoIcon}")`;
  }
}

// Handle GitHub fetch
inputGithubUrl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchBtn.click();
});

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
    if (response.status === 403) throw new Error('GitHub API rate limit exceeded. Please wait a moment and try again.');
    if (response.status === 404) throw new Error('Repository not found. Check the owner/repo and try again.');
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

    const data = await response.json();
    inputRepoName.value = data.name;
    inputRepoDesc.value = data.description || '';
    fetchedRepoSlug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    syncPreview();
  } catch (err) {
    alert(err.message);
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
  const fileSlug = fetchedRepoSlug ?? inputRepoName.value.toLowerCase().replace(/[^a-z0-9]/g, '-');
  exportRepoCard(
    vibrantColor,
    currentRepoIcon,
    inputRepoName.value,
    inputRepoDesc.value,
    inputTintIcon.checked,
    fileSlug
  );
});

setInitValues();

/**
 * Exports the repo social preview as a PNG image at 1280x640
 * @param {string} accentColor - the accent color for the glow
 * @param {string|null} repoIconData - repo icon data URL (or null)
 * @param {string} repoName - repository name
 * @param {string} repoDesc - repository description
 * @param {boolean} shouldTintIcon - whether to tint the icon with the accent color
 * @param {string} [fileSlug] - slug to use for the downloaded filename
 */
async function exportRepoCard(
  accentColor,
  repoIconData,
  repoName,
  repoDesc,
  shouldTintIcon,
  fileSlug,
) {
  // Ensure Lexend is loaded before drawing
  await document.fonts.load('700 1px "Lexend"');
  await document.fonts.load('300 1px "Lexend"');
  return _exportRepoCard(
    accentColor,
    repoIconData,
    repoName,
    repoDesc,
    shouldTintIcon,
    fileSlug,
  );
}

async function _exportRepoCard(
  accentColor,
  repoIconData,
  repoName,
  repoDesc,
  shouldTintIcon,
  fileSlug,
) {
  try {
    const targetWidth = 1280;
    const targetHeight = 640;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Helper: HEX to RGBA
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Helper: split text into wrapped lines (without drawing), returns line array
    const splitLines = (context, text, maxWidth, maxLines) => {
      const words = text.split(' ');
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (context.measureText(testLine).width > maxWidth && n > 0) {
          lines.push(line.trimEnd());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trimEnd());

      const displayLines = lines.slice(0, maxLines);
      if (lines.length > maxLines) {
        let last = displayLines[maxLines - 1];
        while (context.measureText(last + '…').width > maxWidth && last.length > 0) {
          last = last.slice(0, -1);
        }
        displayLines[maxLines - 1] = last + '…';
      }

      return displayLines;
    };

    // Helper: wrap and truncate text, returns number of lines drawn
    const wrapAndTruncate = (context, text, x, y, maxWidth, lineHeight, maxLines) => {
      const displayLines = splitLines(context, text, maxWidth, maxLines);

      for (let k = 0; k < displayLines.length; k++) {
        context.fillText(displayLines[k], x, y + k * lineHeight);
      }

      return displayLines.length;
    };

    // [1] DRAW FIXED DARK BACKGROUND
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Card bounds; mirrors CSS: top/bottom 12.5%, left/right 6.25%
    const cardX = Math.round(targetWidth * 0.0625);   // 80px
    const cardY = Math.round(targetHeight * 0.125);   // 80px
    const cardWidth = targetWidth - cardX * 2;        // 1120px
    const cardHeight = targetHeight - cardY * 2;      // 480px
    const cardRadius = 36;
    const innerPadding = 60;

    // [2] Draw glow effect
    const glowPadding = 80; // inset: -40px scaled up 2x for 1280 canvas
    const glowW = targetWidth + glowPadding * 2;
    const glowH = targetHeight + glowPadding * 2;

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowW;
    glowCanvas.height = glowH;
    const gCtx = glowCanvas.getContext('2d');

    const gGrad = gCtx.createRadialGradient(glowW / 2, glowH / 2, 0, glowW / 2, glowH / 2, glowW / 2);
    gGrad.addColorStop(0,    hexToRgba(accentColor, 0.35));
    gGrad.addColorStop(0.55, hexToRgba(accentColor, 0.15));
    gGrad.addColorStop(0.8,  'rgba(0,0,0,0)');
    gCtx.fillStyle = gGrad;
    gCtx.fillRect(0, 0, glowW, glowH);

    if (typeof StackBlur !== 'undefined') {
      StackBlur.canvasRGB(glowCanvas, 0, 0, glowW, glowH, 96);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(glowCanvas, -glowPadding, -glowPadding);
    ctx.restore();

    // [3] Draw card background & border
    // backdrop-filter: saturate(160%) by re-drawing the card region through a filter
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.clip();
    const saturateCanvas = document.createElement('canvas');
    saturateCanvas.width = targetWidth;
    saturateCanvas.height = targetHeight;
    const sCtx2 = saturateCanvas.getContext('2d');
    sCtx2.drawImage(canvas, 0, 0);
    ctx.filter = 'saturate(160%)';
    ctx.drawImage(saturateCanvas, 0, 0);
    ctx.filter = 'none';
    // Card fill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
    ctx.restore();
    // Card border
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // [4] LAYOUT CONSTANTS; mirrors CSS grid: gap: 20px 60px, padding: 60px
    const colGap = 60;
    const rowGap = 40;

    const nameFontSize = 84;
    const nameLineHeight = nameFontSize * 1.1;
    const nameMaxLines = 2;

    const descFontSize = 30;
    const descLineHeight = descFontSize * 1.5;
    const descMaxLines = 3;

    // In CSS the desc spans both columns ("desc desc"), so its text width is the full inner width.
    // The name area width is 1fr = inner width - colGap - iconColumn width.
    const innerWidth = cardWidth - innerPadding * 2;   // 1000px
    const innerHeight = cardHeight - innerPadding * 2; // 360px

    // [5] Pre-measure desc to determine how many lines it takes, which sizes the icon row
    ctx.font = `300 ${descFontSize}px "Lexend", sans-serif`;
    ctx.letterSpacing = `${descFontSize * 0.02}px`;
    const descLines = splitLines(ctx, repoDesc, innerWidth, descMaxLines);
    const descBlockHeight = descLines.length * descLineHeight;

    // Icon fills the 1fr row: inner height minus row gap and desc block
    const iconSize = innerHeight - rowGap - descBlockHeight;
    const iconX = cardX + cardWidth - innerPadding - iconSize;
    const iconY = cardY + innerPadding;

    // Name text column = 1fr = inner width minus column gap and icon column
    const nameTextWidth = innerWidth - colGap - iconSize;

    // Name is align-self: center within the icon row
    ctx.font = `700 ${nameFontSize}px "Lexend", sans-serif`;
    ctx.letterSpacing = `${-nameFontSize * 0.02}px`;
    const nameLines = splitLines(ctx, repoName, nameTextWidth, nameMaxLines);
    const nameBlockHeight = nameLines.length * nameLineHeight;
    const nameY = iconY + (iconSize - nameBlockHeight) / 2;

    // Desc starts after the icon row + row gap
    const descY = iconY + iconSize + rowGap;
    const nameX = cardX + innerPadding;
    const descX = cardX + innerPadding;

    // [6] Draw repo icon
    if (repoIconData) {
      const iconImg = new Image();
      if (!repoIconData.startsWith('data:')) iconImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        iconImg.onload = resolve;
        iconImg.onerror = reject;
        iconImg.src = repoIconData;
      });

      const iAspect = iconImg.naturalWidth / iconImg.naturalHeight;
      let iW, iH;
      if (iAspect > 1) { iW = iconSize; iH = iconSize / iAspect; }
      else              { iH = iconSize; iW = iconSize * iAspect; }
      const iX = iconX + (iconSize - iW) / 2;
      const iY = iconY + (iconSize - iH) / 2;

      if (shouldTintIcon) {
        const scratch = document.createElement('canvas');
        scratch.width = iW;
        scratch.height = iH;
        const sCtx = scratch.getContext('2d');
        sCtx.drawImage(iconImg, 0, 0, iW, iH);
        sCtx.globalCompositeOperation = 'source-in';
        sCtx.fillStyle = accentColor;
        sCtx.fillRect(0, 0, iW, iH);
        ctx.drawImage(scratch, iX, iY);
      } else {
        ctx.drawImage(iconImg, iX, iY, iW, iH);
      }
    }

    // [7] Draw repo name
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${nameFontSize}px "Lexend", sans-serif`;
    ctx.letterSpacing = `${-nameFontSize * 0.02}px`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    wrapAndTruncate(ctx, repoName, nameX, nameY, nameTextWidth, nameLineHeight, nameMaxLines);

    // [8] Draw description (spans full inner width; same as CSS "desc desc" grid area)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `300 ${descFontSize}px "Lexend", sans-serif`;
    ctx.letterSpacing = `${descFontSize * 0.02}px`;
    ctx.textBaseline = 'top';
    wrapAndTruncate(ctx, repoDesc, descX, descY, innerWidth, descLineHeight, descMaxLines);
    ctx.letterSpacing = '0px';

    // Download image
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = fileSlug ?? repoName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      a.download = `repo-card-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');

  } catch (error) {
    console.error('Error exporting repo card:', error);
    alert('Failed to export image. Please try again.');
  }
}

window.exportRepoCard = exportRepoCard;

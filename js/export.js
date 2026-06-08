/**
 * Exports the repo social preview as a PNG image at 1280x640
 * @param {string} accentColor - the accent color for the glow
 * @param {string|null} repoIconData - repo icon data URL (or null)
 * @param {string} repoName - repository name
 * @param {string} repoDesc - repository description
 * @param {boolean} shouldTintIcon - whether to tint the icon with the accent color
 * @param {boolean} isProminent - whether to use the prominent icon layout
 */
async function exportBanner(accentColor, repoIconData, repoName, repoDesc, shouldTintIcon, isProminent) {
  try {
    const targetWidth = 1280;
    const targetHeight = 640;

    // CREATE CANVAS
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // HELPER: HEX TO RGBA
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // 1. DRAW FIXED DARK BACKGROUND
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // 2. DRAW GLOW EFFECT
    const centerX = targetWidth / 2;
    const centerY = targetHeight / 2;
    
    // Safety margin calculations:
    // top: 12.5% of 640 = 80px
    // left: 6.25% of 1280 = 80px
    const cardX = 80;
    const cardY = 80;
    const cardWidth = targetWidth - (cardX * 2);
    const cardHeight = targetHeight - (cardY * 2);
    
    const glowPadding = 160;
    const glowWidth = cardWidth + glowPadding * 2;
    const glowHeight = cardHeight + glowPadding * 2;
    
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowWidth;
    glowCanvas.height = glowHeight;
    const gCtx = glowCanvas.getContext('2d');
    
    gCtx.save();
    gCtx.translate(glowWidth / 2, glowHeight / 2);
    gCtx.scale(1.2, 0.7); 
    const gGrad = gCtx.createRadialGradient(0, 0, 0, 0, 0, glowWidth / 2.2);
    gGrad.addColorStop(0, hexToRgba(accentColor, 0.35));
    gGrad.addColorStop(0.55, hexToRgba(accentColor, 0.15));
    gGrad.addColorStop(0.8, 'transparent');
    gCtx.fillStyle = gGrad;
    gCtx.fillRect(-glowWidth/2, -glowHeight/2, glowWidth, glowHeight);
    gCtx.restore();
    
    if (typeof StackBlur !== 'undefined') {
      StackBlur.canvasRGB(glowCanvas, 0, 0, glowWidth, glowHeight, 48);
    }
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(glowCanvas, centerX - glowWidth / 2, centerY - glowHeight / 2);
    ctx.restore();

    // 3. DRAW CARD
    const cardRadius = 24;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 4. DRAW REPO ICON
    const innerPadding = 40;
    let iconSize = isProminent ? 180 : 80;
    let iconX, iconY;

    if (isProminent) {
      iconX = cardX + cardWidth - innerPadding - iconSize;
      iconY = cardY + (cardHeight - iconSize) / 2;
    } else {
      iconX = cardX + cardWidth - innerPadding - iconSize;
      iconY = cardY + innerPadding;
    }

    if (repoIconData) {
      const iconImg = new Image();
      if (repoIconData.startsWith('http')) {
        iconImg.crossOrigin = 'anonymous';
      }
      
      await new Promise((resolve, reject) => {
        iconImg.onload = resolve;
        iconImg.onerror = reject;
        iconImg.src = repoIconData;
      });

      const iAspect = iconImg.naturalWidth / iconImg.naturalHeight;
      let iW, iH, iX, iY;
      if (iAspect > 1) {
        iW = iconSize;
        iH = iconSize / iAspect;
      } else {
        iH = iconSize;
        iW = iconSize * iAspect;
      }
      iX = iconX + (iconSize - iW) / 2;
      iY = iconY + (iconSize - iH) / 2;

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

    // 5. DRAW REPO NAME
    ctx.fillStyle = '#FFFFFF';
    const nameFontSize = isProminent ? 44 : 56; // SLIGHTLY ADJUSTED FOR NEW MARGINS
    ctx.font = `bold ${nameFontSize}px "Interstate", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const nameX = cardX + innerPadding;
    const nameY = isProminent ? cardY + cardHeight / 2 - 50 : cardY + innerPadding;
    
    // WORD WRAP HELPER WITH LIMIT
    const wrapAndTruncate = (context, text, x, y, maxWidth, lineHeight, maxLines, drawFromBottom) => {
      const words = text.split(' ');
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const displayLines = lines.slice(0, maxLines);
      if (lines.length > maxLines) {
        let last = displayLines[maxLines - 1];
        displayLines[maxLines - 1] = last.trim().substring(0, last.length - 4) + '...';
      }

      if (drawFromBottom) {
        for (let k = displayLines.length - 1; k >= 0; k--) {
          context.fillText(displayLines[k], x, y - (displayLines.length - 1 - k) * lineHeight);
        }
      } else {
        for (let k = 0; k < displayLines.length; k++) {
          context.fillText(displayLines[k], x, y + k * lineHeight);
        }
      }
    };

    const maxNameWidth = isProminent ? cardWidth - innerPadding * 2 - iconSize - 40 : cardWidth - innerPadding * 2 - iconSize - 20;
    wrapAndTruncate(ctx, repoName, nameX, nameY, maxNameWidth, nameFontSize * 1.1, isProminent ? 3 : 2, false);

    // 6. DRAW DESCRIPTION
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const descFontSize = isProminent ? 18 : 20;
    ctx.font = `${descFontSize}px "Interstate", sans-serif`;
    const descX = cardX + innerPadding;
    const descY = isProminent ? nameY + (3 * nameFontSize * 1.1) + 20 : cardY + cardHeight - innerPadding;
    ctx.textBaseline = isProminent ? 'top' : 'bottom';

    const maxDescWidth = isProminent ? cardWidth * 0.55 : cardWidth - (innerPadding * 2);
    wrapAndTruncate(ctx, repoDesc, descX, descY, maxDescWidth, descFontSize * 1.4, isProminent ? 5 : 3, !isProminent);

    // DOWNLOAD IMAGE
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = repoName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      a.download = `repo-card-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');

  } catch (error) {
    console.error('Error exporting banner:', error);
    alert('Failed to export image. Please try again.');
  }
}

window.exportBanner = exportBanner;

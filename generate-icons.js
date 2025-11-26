import { createCanvas } from 'canvas';
import fs from 'fs';

const sizes = [16, 32, 48, 128];

async function generateIcons() {
    const svgContent = fs.readFileSync('icons/icon.svg', 'utf8');

    for (const size of sizes) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Create a simple gradient background
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#0ea5e9');
        gradient.addColorStop(1, '#22d3ee');

        // Draw background circle
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw GUID representation
        ctx.strokeStyle = 'white';
        ctx.lineWidth = Math.max(2, size / 32);
        ctx.lineCap = 'round';

        const center = size / 2;
        const scale = size / 128;

        // Left bracket
        ctx.beginPath();
        ctx.moveTo(center - 35 * scale, center - 25 * scale);
        ctx.lineTo(center - 40 * scale, center - 25 * scale);
        ctx.lineTo(center - 40 * scale, center + 25 * scale);
        ctx.lineTo(center - 35 * scale, center + 25 * scale);
        ctx.stroke();

        // Right bracket
        ctx.beginPath();
        ctx.moveTo(center + 35 * scale, center - 25 * scale);
        ctx.lineTo(center + 40 * scale, center - 25 * scale);
        ctx.lineTo(center + 40 * scale, center + 25 * scale);
        ctx.lineTo(center + 35 * scale, center + 25 * scale);
        ctx.stroke();

        // Dashes
        const drawLine = (x1, y1, x2, y2) => {
            ctx.beginPath();
            ctx.moveTo(center + x1 * scale, center + y1 * scale);
            ctx.lineTo(center + x2 * scale, center + y2 * scale);
            ctx.stroke();
        };

        drawLine(-25, -12, -10, -12);
        drawLine(-5, -12, 5, -12);
        drawLine(10, -12, 25, -12);

        drawLine(-20, 0, -8, 0);
        drawLine(8, 0, 20, 0);

        drawLine(-25, 12, -10, 12);
        drawLine(-5, 12, 5, 12);
        drawLine(10, 12, 25, 12);

        // Accent dot
        const accentGradient = ctx.createLinearGradient(
            center + 26 * scale,
            center - 30 * scale,
            center + 34 * scale,
            center - 22 * scale
        );
        accentGradient.addColorStop(0, '#f97316');
        accentGradient.addColorStop(1, '#fb923c');

        ctx.fillStyle = accentGradient;
        ctx.beginPath();
        ctx.arc(center + 30 * scale, center - 30 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Save PNG
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`icons/icon${size}.png`, buffer);
        console.log(`Generated icon${size}.png`);
    }
}

generateIcons().catch(console.error);
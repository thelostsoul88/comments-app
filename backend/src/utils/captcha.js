import svgCaptcha from 'svg-captcha';
import sharp from 'sharp';

export const generateCaptchaPng = async (req, res) => {
  const captcha = svgCaptcha.create({
    size: 5, noise: 3, color: true, background: '#eef3ff', width: 150, height: 50,
  });
  if (req.session) req.session.captcha = (captcha.text || '').toLowerCase();
  try {
    const png = await sharp(Buffer.from(captcha.data)).png().toBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).send(png);
  } catch (e) { console.error('captcha png error', e); res.status(500).json({ message: 'captcha error' }); }
};

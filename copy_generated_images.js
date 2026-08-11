import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const artifactsDir = 'C:\\Users\\biel3\\.gemini\\antigravity-ide\\brain\\69e2f7a6-c75f-42c9-829e-3ab22b6f7165';
const targetDir = path.join(process.cwd(), 'public', 'img', 'products');

const mapping = {
  'canjiquinha_card': 'caldo-canjiquinha.webp',
  'caldo_verde_card': 'caldo-verde.webp',
  'feijao_amigo_card': 'feijao-amigo.webp',
  'vaca_atolada_card': 'vaca-atolada.webp',
  'caldo_frango_card': 'caldo-frango.webp',
  'caldo_abobora_card': 'caldo-abobora.webp',
  'batata_bolonhesa_card': 'batata-bolonhesa.webp',
  'batata_bacon_card': 'batata-bacon.webp',
  'batata_bacon_cheddar_card': 'batata-bacon-cheddar.webp',
  'batata_calabresa_card': 'batata-calabresa.webp',
  'batata_frango_card': 'batata-frango.webp',
  'batata_frango_cheddar_card': 'batata-frango-cheddar.webp',
  'batata_strogonoff_card': 'batata-strogonoff.webp'
};

async function processImages() {
  const files = fs.readdirSync(artifactsDir);

  for (const [prefix, targetName] of Object.entries(mapping)) {
    const matchedFile = files.find(f => f.startsWith(prefix) && f.endsWith('.png'));
    if (matchedFile) {
      const srcPath = path.join(artifactsDir, matchedFile);
      const destPath = path.join(targetDir, targetName);
      
      await sharp(srcPath)
        .resize(400, 300, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(destPath);
      
      console.log(`Saved: ${targetName}`);
    }
  }
}

processImages();

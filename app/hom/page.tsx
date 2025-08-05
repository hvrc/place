import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';

async function getImages() {
  const thumbsDir = path.join(process.cwd(), 'public', 'thumbs');
  const files = await fs.readdir(thumbsDir).catch(() => []);
  return files
    .filter(file => file.match(/^hom\d+\.jpeg$/))
    .map(file => file.replace('.jpeg', ''))
    .sort((a, b) => {
      const numA = parseInt(a.replace('hom', ''), 10);
      const numB = parseInt(b.replace('hom', ''), 10);
      return numA - numB;
    });
}

export default async function HomePage() {
  const images = await getImages();

  return (
    <div className="max-w-screen-xl mx-auto relative">
      <div className="absolute left-4 top-4">
        <Link href="/" className="text-xl font hover:text-gray-600 transition-colors">
          back
        </Link>
      </div>
      <br /><br />
      <h1 className="text-center text-4xl mb-8">hॐ</h1>
      <div className="image-wall grid grid-cols-5 gap-4 p-4">
        {images.map((imageName, index) => (
          <div key={index} className="image-item">
            <img 
              src={`/thumbs/${imageName}.jpeg`} 
              alt={imageName} 
              className="w-full h-auto object-cover cursor-pointer" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
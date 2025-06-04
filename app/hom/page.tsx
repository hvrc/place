'use client'; // Make this a Client Component

import Link from 'next/link';

const ImageWall = () => {
  const imageCount = 200;
  const images = [];

  for (let i = 1; i <= imageCount; i++) {
    images.push(`hom${i}`);
  }

  return (
    <div className="image-wall grid grid-cols-5 gap-4 p-4">
      {images.map((imageName, index) => (
        <div key={index} className="image-item">
          <Link href={`/hom/${imageName}`} passHref>
            <img 
              src={`/thumbs/${imageName}.jpeg`} 
              alt={imageName} 
              className="w-full h-auto object-cover cursor-pointer" 
            />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <br /><br />
      <h1 className="text-center text-4xl mb-8">hॐ</h1>
      <ImageWall />
    </div>
  );
}

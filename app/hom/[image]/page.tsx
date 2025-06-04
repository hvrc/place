'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

const ImagePage = () => {
  // const { image } = useParams();
  // if (!image) return <div>Image not found</div>; 
  // const imageNumber = parseInt((Array.isArray(image) ? image[0] : image).replace('hom', ''), 10);
  // const totalImages = 200;
  // const previousImage = imageNumber > 1 ? `hom${imageNumber - 1}` : null;
  // const nextImage = imageNumber < totalImages ? `hom${imageNumber + 1}` : null;

  // const imagePath = `/hom/${image}.png`;

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen">
      {/* <h1 className="absolute left-0 top-8 text-2xl font-bold pl-4">{image}</h1> */}
      <div className="absolute left-0 top-24 flex flex-col items-start pl-4">
        {/* {previousImage && (
          <a href={`/hom/${previousImage}`} className="text-xl font-bold mb-2">
            <h3>Previous</h3>
          </a>
        )}
        {nextImage && (
          <a href={`/hom/${nextImage}`} className="text-xl font-bold">
            <h3>Next</h3>
          </a>
        )} */}
        <br />
        <a href={`/hom`} className="text-xl">
          <h3>hॐ</h3>
        </a>
        {/* <a href="/" className="text-xl font-bold">
          <h3>home</h3>
        </a> */}
      </div>
      <img
        alt='hmu if u want a full res'
        // src={imagePath} 
        className="w-[75%] sm:w-[65%] md:w-[55%] lg:w-[50%] xl:w-[45%] object-contain" 
      />
    </div>
  );
};

export default ImagePage;

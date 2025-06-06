import Link from 'next/link';

export async function generateStaticParams() {
  const imageCount = 200;
  const params = [];
  
  for (let i = 1; i <= imageCount; i++) {
    params.push({ image: `hom${i}` });
  }
  
  return params;
}

type Props = {
  params: {
    image: string
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ImagePage({ params }: Props) {
  const { image } = params;
  const imageNumber = parseInt(image.replace('hom', ''), 10);
  const totalImages = 200;
  const previousImage = imageNumber > 1 ? `hom${imageNumber - 1}` : null;
  const nextImage = imageNumber < totalImages ? `hom${imageNumber + 1}` : null;

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen">
      <h1 className="absolute left-0 top-8 text-2xl font-bold pl-4">{image}</h1>
      <div className="absolute left-0 top-24 flex flex-col items-start pl-4">
        {previousImage && (
          <Link href={`/hom/${previousImage}`} className="text-xl font-bold mb-2">
            <h3>Previous</h3>
          </Link>
        )}
        {nextImage && (
          <Link href={`/hom/${nextImage}`} className="text-xl font-bold">
            <h3>Next</h3>
          </Link>
        )}
        <br />
        <Link href="/hom" className="text-xl">
          <h3>hॐ</h3>
        </Link>
      </div>
      
      <p className="text-xl text-gray-600">
        hmu if you want full res
      </p>
     
      
      {/* <img
        src={`/images/hom/${image}.png`}
        alt={image}
        className="w-[75%] sm:w-[65%] md:w-[55%] lg:w-[50%] xl:w-[45%] object-contain"
      /> */}
    </div>
  );
}
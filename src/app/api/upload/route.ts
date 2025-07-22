
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
  // Move a configuração para dentro da função POST
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('API Upload Route: Request received');
  console.log('Cloudinary Config - Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  console.log('Cloudinary Config - API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
  console.log('Cloudinary Config - API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    console.log('API Upload Route: No file received.');
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  console.log(`API Upload Route: File received - Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

  try {
    // Converte o arquivo para um buffer
    const fileBuffer = await file.arrayBuffer();
    const mime = file.type;
    const encoding = 'base64';
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;

    console.log('API Upload Route: Attempting Cloudinary upload...');

    // Faz o upload para o Cloudinary
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'chuteflix-uploads', // Uma pasta para organizar os arquivos no Cloudinary
    });

    console.log('API Upload Route: Cloudinary upload successful:', result.secure_url);
    return NextResponse.json({ url: result.secure_url }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no upload para o Cloudinary:', error);
    // Retorna a mensagem de erro específica do Cloudinary para depuração
    return NextResponse.json({ error: error.message || 'Falha no upload da imagem.' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configura o Cloudinary com as credenciais do ambiente
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  try {
    // Converte o arquivo para um buffer
    const fileBuffer = await file.arrayBuffer();
    const mime = file.type;
    const encoding = 'base64';
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;

    // Faz o upload para o Cloudinary
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'chuteflix-uploads', // Uma pasta para organizar os arquivos no Cloudinary
    });

    return NextResponse.json({ url: result.secure_url }, { status: 200 });
  } catch (error) {
    console.error('Erro no upload para o Cloudinary:', error);
    return NextResponse.json({ error: 'Falha no upload da imagem.' }, { status: 500 });
  }
}

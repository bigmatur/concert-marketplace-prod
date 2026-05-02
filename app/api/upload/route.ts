// app/api/upload/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `chat-messages/${fileName}`;

    // Загружаем файл в Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Получаем публичный URL файла
    const { data } = supabase.storage
      .from('chat-files')
      .getPublicUrl(filePath);

    console.log('File uploaded:', { fileName, url: data.publicUrl });

    return NextResponse.json({
      url: data.publicUrl,
      fileName: file.name,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
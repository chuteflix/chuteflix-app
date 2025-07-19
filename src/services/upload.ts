
// Este arquivo contém funções SEGURAS para serem usadas no CLIENTE.

/**
 * Envia um arquivo para a nossa API Route de upload.
 * Esta função pode ser usada em qualquer componente de cliente sem vazar segredos.
 * @param file O arquivo a ser enviado.
 * @returns A URL segura do arquivo no Cloudinary.
 */
export async function uploadFileToApi(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Falha no upload.');
  }

  const data = await response.json();
  return data.url;
}

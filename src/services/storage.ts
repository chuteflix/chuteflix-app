
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

/**
 * Faz o upload de um arquivo para o Firebase Storage.
 * @param file O arquivo a ser enviado.
 * @param path O caminho completo no Storage onde o arquivo será salvo (ex: 'users/userId/profile.jpg').
 * @returns A URL de download do arquivo.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error("Nenhum arquivo fornecido para o upload.");
  }

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

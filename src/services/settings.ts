
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Settings } from "@/types";
import { uploadFileToApi } from "./upload"; // Importa a função de upload para o Cloudinary

const SETTINGS_DOC_ID = "main_settings";

// Busca as configurações do Firestore
export const getSettings = async (): Promise<Settings | null> => {
  try {
    const docRef = doc(db, "settings", SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Settings;
    } else {
      console.log("No settings document found!");
      return null;
    }
  }

  catch (error) {
    console.error("Error getting settings:", error);
    throw new Error("Could not fetch settings.");
  }
};

// Salva as configurações no Firestore
export const saveSettings = async (data: Partial<Settings>) => {
  try {
    const settingsRef = doc(db, "settings", SETTINGS_DOC_ID);
    await setDoc(settingsRef, 
        { 
            ...data, 
            updatedAt: serverTimestamp() 
        }, 
        { merge: true }
    );
  } catch (error) {
    console.error("Error saving settings:", error);
    throw new Error("Could not save settings.");
  }
};

// Faz upload da imagem do QR Code e retorna a URL
export const uploadQrCode = async (file: File): Promise<string> => {
    if (!file) {
        throw new Error("No file provided for QR code upload.");
    }

    try {
        // Usa a função uploadFileToApi que já integra com o Cloudinary
        const downloadURL = await uploadFileToApi(file);
        
        // A URL agora é retornada para ser salva junto com o resto do formulário.
        // Opcionalmente, pode-se salvar diretamente aqui se o fluxo exigir, mas
        // salvar tudo de uma vez no formulário é mais seguro.
        // await saveSettings({ qrCodeUrl: downloadURL });

        return downloadURL;
    } catch (error) {
        console.error("Error uploading QR code:", error);
        throw new Error("Could not upload QR code.");
    }
};

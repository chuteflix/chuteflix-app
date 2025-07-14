
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Settings } from "@/types";

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
  } catch (error) {
    console.error("Error getting settings:", error);
    throw new Error("Could not fetch settings.");
  }
};

// Salva as configurações no Firestore
export const saveSettings = async (data: Partial<Omit<Settings, 'qrCodeUrl'>>) => {
  try {
    const settingsRef = doc(db, "settings", SETTINGS_DOC_ID);
    await setDoc(settingsRef, { 
        ...data, 
        updatedAt: serverTimestamp() 
    }, { merge: true });
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
        const storageRef = ref(storage, `settings/${SETTINGS_DOC_ID}/qr_code.png`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Salva a URL no documento de configurações
        await saveSettings({ qrCodeUrl: downloadURL });

        return downloadURL;
    } catch (error) {
        console.error("Error uploading QR code:", error);
        throw new Error("Could not upload QR code.");
    }
};

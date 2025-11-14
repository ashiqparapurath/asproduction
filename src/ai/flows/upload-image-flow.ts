'use server';
/**
 * @fileOverview A flow for uploading images to Firebase Storage.
 *
 * - uploadImage - A function that handles the image upload process.
 * - UploadImageInput - The input type for the uploadImage function.
 * - UploadImageOutput - The return type for the uploadImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Re-import server-only dependencies here
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Create a dedicated, server-safe initialization function
function initializeServerFirebase() {
  if (typeof window === 'undefined') {
    if (getApps().length) {
      const app = getApp();
      return { firebaseApp: app, storage: getStorage(app) };
    }
    const app = initializeApp(firebaseConfig);
    return { firebaseApp: app, storage: getStorage(app) };
  }
  throw new Error("Attempted to call server-side Firebase initialization on the client.");
}


const UploadImageInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The image file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The original name of the file.'),
  userId: z.string().describe('The UID of the user uploading the file.'),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  downloadUrl: z.string().describe('The public URL of the uploaded image.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;

export async function uploadImage(input: UploadImageInput): Promise<UploadImageOutput> {
  return uploadImageFlow(input);
}

const uploadImageFlow = ai.defineFlow(
  {
    name: 'uploadImageFlow',
    inputSchema: UploadImageInputSchema,
    outputSchema: UploadImageOutputSchema,
  },
  async (input) => {
    // Use the server-specific initializeFirebase function
    const { storage } = initializeServerFirebase();
    
    // Extract file extension and generate a unique name
    const fileExtension = input.fileName.split('.').pop() || 'jpg';
    const imageId = uuidv4();
    const uniqueFileName = `${imageId}.${fileExtension}`;
    
    const storageRef = ref(storage, `products/${input.userId}/${uniqueFileName}`);

    // Upload the image using the data URI
    const snapshot = await uploadString(storageRef, input.fileDataUri, 'data_url');
    
    // Get the public URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      downloadUrl,
    };
  }
);

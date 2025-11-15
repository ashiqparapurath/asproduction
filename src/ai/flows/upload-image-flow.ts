'use server';
/**
 * @fileOverview A server-side flow for uploading images to Firebase Storage.
 *
 * - uploadImage - A function that handles the image upload process.
 * - UploadImageInput - The input type for the uploadImage function.
 * - UploadImageOutput - The return type for the uploadImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

// Define a separate, server-side initialization for Firebase
// This avoids conflicts with client-side initialization.
async function initializeFirebaseAdmin() {
  if (getApps().some(app => app.name === 'genkit-server')) {
    return getApp('genkit-server');
  }
  return initializeApp(firebaseConfig as FirebaseOptions, 'genkit-server');
}

const UploadImageInputSchema = z.object({
  imageDataUri: z.string().describe(
    "A data URI of the image to upload. Must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  userId: z.string().describe('The UID of the user uploading the image.'),
  fileName: z.string().describe('The name of the file to be saved.'),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  downloadUrl: z.string().describe('The public URL of the uploaded image.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;

// This is the exported function that components will call.
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
    try {
      const app = await initializeFirebaseAdmin();
      const storage = getStorage(app);
      
      const { imageDataUri, userId, fileName } = input;
      
      // Extract mime type and base64 data from the data URI
      const match = imageDataUri.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/);
      if (!match) {
        throw new Error('Invalid data URI format.');
      }
      const mimeType = match[1];
      const base64Data = match[2];

      const storagePath = `products/${userId}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      // Upload the image using the base64 string
      const snapshot = await uploadString(storageRef, base64Data, 'base64', {
          contentType: mimeType,
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);

      return { downloadUrl };

    } catch (e: any) {
        console.error("[uploadImageFlow Error]", e);
        // Re-throw the error to be caught by the client-side caller
        throw new Error(`Image upload failed: ${e.message || 'An unknown error occurred'}`);
    }
  }
);

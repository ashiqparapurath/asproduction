'use server';
/**
 * @fileOverview A flow for uploading images to Firebase Storage.
 *
 * - uploadImage - A function that handles the image upload process.
 * - UploadImageInput - The input type for the uploadImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Ensure Firebase is initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const storage = getStorage();

const UploadImageInputSchema = z.object({
  fileDataUri: z.string().describe("The image file as a data URI."),
  fileName: z.string().describe("The name of the file."),
  userId: z.string().describe("The UID of the user uploading the file."),
  onProgress: z.function().args(z.number()).returns(z.void()).optional().describe("Callback for upload progress."),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;


export async function uploadImage(input: UploadImageInput): Promise<string> {
  return await uploadImageFlow(input);
}


const uploadImageFlow = ai.defineFlow(
  {
    name: 'uploadImageFlow',
    inputSchema: UploadImageInputSchema,
    outputSchema: z.string(),
  },
  async ({ fileDataUri, fileName, userId, onProgress }) => {
    // Sanitize file name
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `products/${userId}/${Date.now()}_${safeFileName}`);
    
    // The uploadString function in Firebase JS SDK v9+ does not have a direct progress callback.
    // The comment about onProgress is for conceptual clarity but not directly implemented by uploadString.
    // For real progress, you would typically use uploadBytesResumable, but that's more complex
    // and might be overkill for this flow. We can simulate progress.

    if(onProgress) onProgress(10);

    const snapshot = await uploadString(storageRef, fileDataUri, 'data_url');
    
    if(onProgress) onProgress(80);

    const downloadURL = await getDownloadURL(snapshot.ref);

    if(onProgress) onProgress(100);

    return downloadURL;
  }
);

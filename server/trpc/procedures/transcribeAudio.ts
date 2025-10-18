import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { minioClient } from "~/server/minio";

export const transcribeAudio = baseProcedure
  .input(z.object({
    voiceUrl: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured for transcription");
    }

    try {
      // Extract bucket and object name from the voice URL
      const urlParts = input.voiceUrl.split('/');
      const bucketName = urlParts[urlParts.length - 2];
      const objectName = urlParts[urlParts.length - 1];

      // Download the audio file from Minio
      const stream = await minioClient.getObject(bucketName, objectName);
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const audioBuffer = Buffer.concat(chunks);

      // Create FormData for OpenAI Whisper API
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      // Call OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        text: result.text,
        language: result.language,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  });

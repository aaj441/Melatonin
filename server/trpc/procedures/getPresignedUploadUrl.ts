import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient } from "~/server/minio";

export const getPresignedUploadUrl = baseProcedure
  .input(z.object({ 
    fileName: z.string(),
    contentType: z.string()
  }))
  .mutation(async ({ input }) => {
    const bucketName = "dream-recordings";
    const objectName = `${Date.now()}-${input.fileName}`;
    
    // Generate presigned URL valid for 10 minutes
    const presignedUrl = await minioClient.presignedPutObject(
      bucketName,
      objectName,
      10 * 60
    );
    
    return {
      uploadUrl: presignedUrl,
      objectName,
      bucketName,
    };
  });

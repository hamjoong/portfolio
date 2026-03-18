import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client();

/**
 * S3에 업로드된 이미지를 WebP로 변환하고 리사이징하는 람다 함수입니다.
 * [이유] 원본 이미지는 용량이 커서 웹 성능을 저하시키므로, 효율적인 WebP 포맷과 
 * 적절한 해상도로 변환하여 사용자에게 빠른 로딩 속도(LCP 개선)를 제공하기 위함입니다.
 */
export const handler = async (event) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const targetKey = key.replace("raw/", "optimized/").replace(/\.[^.]+$/, ".webp");

    try {
        // 1. S3에서 원본 이미지 가져오기
        const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        const stream = response.Body;
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // 2. Sharp를 이용한 이미지 처리 (리사이징 및 WebP 변환)
        // [이유] WebP는 동일 화질 대비 용량이 JPG보다 약 30% 이상 작아 네트워크 비용을 절감하기 때문입니다.
        const optimizedBuffer = await sharp(buffer)
            .resize({ width: 800, withoutEnlargement: true }) // 최대 너비 800px로 제한
            .webp({ quality: 80 }) // 품질 80%의 WebP로 변환
            .toBuffer();

        // 3. 최적화된 이미지를 S3의 optimized/ 경로에 저장
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: targetKey,
            Body: optimizedBuffer,
            ContentType: "image/webp"
        }));

        console.log(`[Success] Optimized: ${key} -> ${targetKey}`);
    } catch (error) {
        console.error("[Error] Image optimization failed:", error);
        throw error;
    }
};

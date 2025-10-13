import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Configuración de Cloudinary - se inicializa solo si las variables están disponibles
function initializeCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      "Cloudinary not configured - some environment variables are missing"
    );
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log(`Cloudinary configured for cloud: ${cloudName}`);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Inicializar Cloudinary y verificar configuración
    const isCloudinaryConfigured = initializeCloudinary();

    if (!isCloudinaryConfigured) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      const missingVars = [];
      if (!cloudName) missingVars.push("CLOUDINARY_CLOUD_NAME");
      if (!apiKey) missingVars.push("CLOUDINARY_API_KEY");
      if (!apiSecret) missingVars.push("CLOUDINARY_API_SECRET");

      console.error("Missing Cloudinary environment variables:", missingVars);

      const isDev = process.env.NODE_ENV === "development";
      const errorMessage = isDev
        ? `Variables de entorno faltantes: ${missingVars.join(
            ", "
          )}. Agrega estas variables a tu archivo .env.local`
        : "Error de configuración del servidor. Contacta al administrador.";

      return NextResponse.json(
        {
          ok: false,
          error: errorMessage,
          ...(isDev && { missingVars }),
        },
        { status: 500 }
      );
    }

    // Verificar que el request tenga FormData
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Content-Type debe ser multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No se encontró archivo válido en el request" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Solo se permiten archivos de imagen" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "El archivo es demasiado grande. Máximo 10MB" },
        { status: 400 }
      );
    }

    console.log(
      `Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`
    );

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result: UploadApiResponse = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "motorlider/products",
            resource_type: "auto",
            quality: "auto",
            fetch_format: "auto",
          },
          (
            err: UploadApiErrorResponse | undefined,
            res: UploadApiResponse | undefined
          ) => {
            if (err) {
              console.error("Cloudinary upload error:", err);
              return reject(new Error(`Cloudinary error: ${err.message}`));
            }
            if (!res) {
              console.error("Cloudinary upload failed: no response");
              return reject(
                new Error("Upload failed: no response from Cloudinary")
              );
            }
            return resolve(res);
          }
        );
        stream.end(buffer);
      }
    );

    console.log(`Upload successful: ${result.secure_url}`);

    return NextResponse.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (e: unknown) {
    console.error("Upload error:", e);

    // Manejar errores específicos de Cloudinary
    if (e instanceof Error) {
      if (e.message.includes("Cloudinary error")) {
        return NextResponse.json(
          {
            ok: false,
            error: "Error al subir a Cloudinary. Intenta nuevamente.",
          },
          { status: 502 }
        );
      }
      if (e.message.includes("timeout")) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Timeout al subir imagen. Intenta con una imagen más pequeña.",
          },
          { status: 504 }
        );
      }
    }

    const message =
      e instanceof Error ? e.message : "Error interno del servidor";
    return NextResponse.json(
      { ok: false, error: `Error al subir imagen: ${message}` },
      { status: 500 }
    );
  }
}

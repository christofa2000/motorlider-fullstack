import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Si tu host lo respeta, evita timeouts cortos en frío:
export const maxDuration = 20;

/* ===== CORS helpers (por si tu front y API están en distinto origen) ===== */
const ORIGIN = process.env.ALLOWED_ORIGIN || "*"; // pon tu dominio si querés
function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", ORIGIN);
  res.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return res;
}
export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}
/* ======================================================================= */

function initializeCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary not configured - missing envs");
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return true;
}

export async function GET() {
  // healthcheck para ver logs en Netlify Functions
  const ok =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

  return cors(
    NextResponse.json(
      { ok, cloud: process.env.CLOUDINARY_CLOUD_NAME ?? null },
      { status: 200 }
    )
  );
}

export async function POST(req: NextRequest) {
  try {
    // Inicializar Cloudinary y verificar configuración
    if (!initializeCloudinary()) {
      const missing: string[] = [];
      if (!process.env.CLOUDINARY_CLOUD_NAME)
        missing.push("CLOUDINARY_CLOUD_NAME");
      if (!process.env.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
      if (!process.env.CLOUDINARY_API_SECRET)
        missing.push("CLOUDINARY_API_SECRET");

      const isDev = process.env.NODE_ENV === "development";
      const msg = isDev
        ? `Variables faltantes: ${missing.join(", ")}`
        : "Error de configuración del servidor. Contacta al administrador.";

      return cors(
        NextResponse.json({ ok: false, error: msg, missing }, { status: 500 })
      );
    }

    // Validar Content-Type
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return cors(
        NextResponse.json(
          {
            ok: false,
            error: "Content-Type inválido (multipart/form-data requerido)",
          },
          { status: 415 }
        )
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return cors(
        NextResponse.json(
          { ok: false, error: "Archivo 'file' requerido" },
          { status: 400 }
        )
      );
    }

    if (!file.type.startsWith("image/")) {
      return cors(
        NextResponse.json(
          { ok: false, error: "Solo se permiten imágenes" },
          { status: 415 }
        )
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return cors(
        NextResponse.json(
          { ok: false, error: "Archivo demasiado grande (máx 10MB)" },
          { status: 413 }
        )
      );
    }

    // Buffer y subida con timeout explícito
    const buffer = Buffer.from(await file.arrayBuffer());

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("UPLOAD_TIMEOUT")),
        15000
      );
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
          clearTimeout(timeout);
          if (err) return reject(new Error(`CLOUDINARY:${err.message}`));
          if (!res) return reject(new Error("CLOUDINARY:NO_RESPONSE"));
          resolve(res);
        }
      );
      stream.end(buffer);
    });

    return cors(
      NextResponse.json(
        { ok: true, url: result.secure_url, publicId: result.public_id },
        { status: 200 }
      )
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // Clasificar errores
    if (msg === "UPLOAD_TIMEOUT") {
      return cors(
        NextResponse.json(
          { ok: false, error: "Timeout subiendo a Cloudinary" },
          { status: 504 }
        )
      );
    }
    if (msg.startsWith("CLOUDINARY:") || msg.includes("ENOTFOUND")) {
      return cors(
        NextResponse.json(
          { ok: false, error: "Error al subir a Cloudinary" },
          { status: 502 }
        )
      );
    }
    return cors(
      NextResponse.json(
        { ok: false, error: "Error interno al subir imagen", detail: msg },
        { status: 500 }
      )
    );
  }
}

// app/farcaster.json/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  // 🔹 Detectamos si estamos en producción por el dominio
  const isProduction = url.host === "vendor-wars.vercel.app";

  // 🔹 Forzamos la URL base según el entorno
  const baseUrl = isProduction
    ? "https://vendor-wars.vercel.app"
    : "https://vendor-wars-git-dev-disidentes-projects.vercel.app";

  // 🔹 LOG para verificar qué baseUrl se está usando
  console.log("🌎 Entorno detectado:", isProduction ? "PRODUCCIÓN" : "DEV");
  console.log("🔗 URL detectada:", url.href);
  console.log("🏠 Base URL establecida:", baseUrl);

  // Config base común para todos los entornos
  const config: Record<string, any> = {
    frame: {
      version: "1",
      name: "Vendor Wars",
      iconUrl: `${baseUrl}/icon.png`,
      homeUrl: baseUrl,
      imageUrl: `${baseUrl}/og-image.png`,
      buttonTitle: "⚔️ Start Battle",
      splashImageUrl: `${baseUrl}/og-image.png`,
      splashBackgroundColor: "#f97316",
      webhookUrl: `${baseUrl}/api/webhook`,
      description: "Battle of the vendors - who will reign supreme?",
      keywords: [
        "farcaster",
        "miniapp",
        "vendor",
        "battle",
        "competition",
        "food",
        "latam",
      ],
    },
    baseBuilder: {
      allowedAddresses: ["0xa2CEC6063307a3Aa11f9A170Ca7a34F6e841D08C"],
    },
  };

// ✅ Usamos credenciales distintas según el entorno
if (isProduction) {
  config.accountAssociation = {
    header:
      "eyJmaWQiOjQ5Nzg2NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweERFOTdEMTc1NTBhNzI0NkIxYzRGYjAwZDFkNDNlOTdDMzhhMURERkEifQ",
    payload:
      "eyJkb21haW4iOiJ2ZW5kb3Itd2Fycy52ZXJjZWwuYXBwIn0",
    signature:
      "MHg1ZGVjOGYwZGU4ZGFlMDBkMmY1YTE1NDZjNzAwMjk1NWE2YTg1NDIxZGNmZGM0MTRiNWIyZDUxMTAxMWJmNjZjNmY0ZTkxZDI0ODlkYjUzMzM2YTI2NWU1ZDU4YmQ4MzIzZjY5YmEzNWJlZWUyZDFiZDZlNThmODRhZGE3MWNjMTFi"
  };
} else {
  config.accountAssociation = {
    header:
      "eyJmaWQiOjQ5Nzg2NiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDUwMjQ2OTNjZjZkZTRCNTYxMjk2NWE0NzkyMDQxNzEwZDVlQkMwOWEifQ",
    payload:
      "eyJkb21haW4iOiJ2ZW5kb3Itd2Fycy1naXQtZGV2LWRpc2lkZW50ZXMtcHJvamVjdHMudmVyY2VsLmFwcCJ9",
    signature:
      "P7WMT/XSxypFaM91ikUmtAiOFjryxki6vCCdXGlyIlpYap/9acEgG7dO6hNsO1wbJpiZPZVEN+I08iJPvqODIhs="
  };
}

  return NextResponse.json(config);
}

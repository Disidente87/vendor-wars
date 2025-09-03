// app/farcaster.json/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Detecta entornos automáticamente según el dominio
  const isProduction = url.host === "vendor-wars.vercel.app";
  const isStaging = url.host.includes("git-dev"); // Para el branch "dev" en Vercel Preview

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

  // Account association para producción
  const prodAccountAssociation = {
    header:
      "eyJmaWQiOjQ5Nzg2NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweERFOTdEMTc1NTBhNzI0NkIxYzRGYjAwZDFkNDNlOTdDMzhhMURERkEifQ",
    payload:
      "eyJkb21haW4iOiJ2ZW5kb3Itd2Fycy52ZXJjZWwuYXBwIn0",
    signature:
      "MHg1ZGVjOGYwZGU4ZGFlMDBkMmY1YTE1NDZjNzAwMjk1NWE2YTg1NDIxZGNmZGM0MTRiNWIyZDUxMTAxMWJmNjZjNmY0ZTkxZDI0ODlkYjUzMzM2YTI2NWU1ZDU4YmQ4MzIzZjY5YmEzNWJlZWUyZDFiZDZlNThmODRhZGE3MWNjMTFi",
  };

  // Account association para staging / dev
  const stagingAccountAssociation = {
    header:
      "eyJmaWQiOjQ5Nzg2NiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDUwMjQ2OTNjZjZkZTRCNTYxMjk2NWE0NzkyMDQxNzEwZDVlQkMwOWEifQ",
    payload:
      "eyJkb21haW4iOiJ2ZW5kb3Itd2Fycy1naXQtZGV2LWRpc2lkZW50ZXMtcHJvamVjdHMudmVyY2VsLmFwcCJ9",
    signature:
      "XSxypFaM91ikUmtAiOFjryxki6vCCdXGlyIlpYap/9acEgG7dO6hNsO1wbJpiZPZVEN+I08iJPvqODIhs=",
  };

  // Aplicar account association según el entorno
  if (isProduction) {
    config.accountAssociation = prodAccountAssociation;
  } else if (isStaging) {
    config.accountAssociation = stagingAccountAssociation;
  }

  return NextResponse.json(config);
}

export function getHostFromRequest(request: any): string {
  // Si tenemos una URL de ngrok configurada, usarla
  if (process.env.NGROK_URL) {
    try {
      const ngrokUrl = new URL(process.env.NGROK_URL);
      return ngrokUrl.host;
    } catch (error) {
      console.warn("Invalid NGROK_URL:", error);
    }
  }

  // Obtener el host de los headers
  const forwardedHost = request.headers["x-forwarded-host"];
  const forwardedProto = request.headers["x-forwarded-proto"];
  const host = request.headers.host;

  if (forwardedHost && forwardedProto) {
    return forwardedHost;
  }

  if (!host) {
    // Si estamos en desarrollo, usar localhost
    if (process.env.NODE_ENV === "development") {
      return `localhost:${process.env.PORT || 3001}`;
    }
    throw new Error("No host found in request");
  }

  return host;
}

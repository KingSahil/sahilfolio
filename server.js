const server = Bun.serve({
  port: 8080,
  hostname: "0.0.0.0",
  fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname.slice(1));
    if (pathname === "favicon.ico") return new Response(null, { status: 204 });
    if (!pathname || pathname === "") pathname = "index.html";

    const f = Bun.file(pathname);

    // Audio tracks served with custom mime/headers so IDM and browser downloaders ignore them
    if (pathname.endsWith('.track')) {
      return new Response(f, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'inline',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }

    return new Response(f);
  },
});

console.log(`Server running at http://localhost:${server.port} / http://0.0.0.0:${server.port}`);

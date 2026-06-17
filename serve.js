import { join } from "path";

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname === "/" || pathname === "") {
      pathname = "/sandbox/index.html";
    }

    // Resolve absolute path safely
    const filePath = join(import.meta.dir, pathname);
    return new Response(Bun.file(filePath));
  },
});

console.log(`Bun static server running at http://localhost:${server.port}`);

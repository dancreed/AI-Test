export default {
  async fetch(request, env, ctx) {
    if (request.method === "POST") {
      const { prompt } = await request.json();
      // Call Cloudflare Workers AI (Flux-1 Schnell model)
      const aiResponse = await env.AI.run(
        "@cf/black-forest-labs/flux-1-schnell",
        { prompt }
      );
      // The result will include the base64 PNG string
      return new Response(
        JSON.stringify({
          image: "data:image/png;base64," + aiResponse.image,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Serve the UI
    return new Response(
      `
      <html>
        <body>
          <h1>FLUX Image Generator</h1>
          <form id="form">
            <input type="text" name="prompt" placeholder="Describe your image" />
            <button type="submit">Generate</button>
          </form>
          <div id="output"></div>
          <script>
            const form = document.getElementById('form');
            const output = document.getElementById('output');
            form.onsubmit = async (e) => {
              e.preventDefault();
              output.textContent = 'Generating...';
              const prompt = form.prompt.value;
              const res = await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
              });
              const data = await res.json();
              output.innerHTML = '<img src="' + data.image + '" />';
            };
          </script>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  },
};

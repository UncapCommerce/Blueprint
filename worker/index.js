// Cloudflare Worker entry point.
// All dynamic /api routes were retired along with the /build reservation
// flow; the Worker now just delegates every request to the Workers Static
// Assets binding configured in wrangler.toml.

export default {
  async fetch(request, env, ctx) {
    return env.ASSETS.fetch(request);
  },
};

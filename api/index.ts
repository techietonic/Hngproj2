// A Vercel function must never start the local Vite development server. Set
// production before importing the app so the module is safe even when a
// preview environment has not supplied NODE_ENV explicitly.
process.env.NODE_ENV = 'production';
const { createApp } = await import('../server.js');

// Export the Express instance itself. Vercel's Node runtime recognizes this
// as a serverless Express app and forwards the original request path to it.
// Creating it once also avoids rebuilding the database client on every call.
const app = await createApp();

export default app;

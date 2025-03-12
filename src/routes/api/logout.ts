import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async () => {
  return new Response(JSON.stringify({ message: 'Logged out' }), {
    status: 200,
    headers: {
      'Set-Cookie': `user=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      'Content-Type': 'application/json'
    }
  });
};
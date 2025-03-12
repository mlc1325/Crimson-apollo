import { getAuth } from "firebase-admin/auth";
import * as admin from 'firebase-admin';
import type { RequestHandler } from '@sveltejs/kit';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Optionally, specify other initialization options like databaseURL
  });
}

export const POST: RequestHandler = async ({ request }) => {
  const { token } = await request.json();

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const user = decodedToken;

    // Set a cookie with the user info
    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: {
        'Set-Cookie': `user=${JSON.stringify(user)}; HttpOnly; Path=/;`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
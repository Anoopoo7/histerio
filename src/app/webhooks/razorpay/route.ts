import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8080';

export async function POST(req: NextRequest) {
  const targetUrl = `${BACKEND_URL.replace(/\/+$/, '')}/webhooks/razorpay`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Exclude hop-by-hop headers
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const body = await req.arrayBuffer();

  try {
    const backendRes = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
    });

    const responseData = await backendRes.arrayBuffer();
    const responseHeaders = new Headers();

    backendRes.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseData, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      {
        statusCode: 502,
        message: `Unable to forward Razorpay webhook to backend server at ${BACKEND_URL}.`,
        error: err instanceof Error ? err.message : 'Connection failed',
      },
      { status: 502 }
    );
  }
}

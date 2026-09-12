import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8080';

async function proxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathString = path ? path.join('/') : '';
  const searchParams = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL.replace(/\/+$/, '')}/${pathString}${searchParams}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Exclude hop-by-hop headers
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const method = req.method;
  const body = ['GET', 'HEAD'].includes(method) ? undefined : await req.arrayBuffer();

  try {
    const backendRes = await fetch(targetUrl, {
      method,
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
        message: `Unable to connect to backend server at ${BACKEND_URL}. Ensure your backend server (histeria-backend) is running.`,
        error: err instanceof Error ? err.message : 'Connection refused',
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;

import { NextRequest, NextResponse } from 'next/server';
import { isWeComConfigured, wecom } from '@/lib/wecom/config';
import { decrypt, signature } from '@/lib/wecom/crypto';
import { routeStaffReply } from '@/lib/wecom/relay';

export const runtime = 'nodejs';

function xmlField(xml: string, tag: string): string {
  const cdata = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(xml);
  if (cdata) return cdata[1];
  const plain = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(xml);
  return plain ? plain[1] : '';
}

/** WeCom URL verification (GET on callback setup): echo the decrypted echostr. */
export async function GET(req: NextRequest) {
  if (!isWeComConfigured()) return new NextResponse('not_configured', { status: 503 });
  const p = req.nextUrl.searchParams;
  const msgSignature = p.get('msg_signature') ?? '';
  const timestamp = p.get('timestamp') ?? '';
  const nonce = p.get('nonce') ?? '';
  const echostr = p.get('echostr') ?? '';
  if (signature(timestamp, nonce, echostr) !== msgSignature) {
    return new NextResponse('bad_signature', { status: 401 });
  }
  try {
    const { message, receiveId } = decrypt(echostr);
    if (receiveId && receiveId !== wecom.corpId) return new NextResponse('bad_receiveid', { status: 401 });
    return new NextResponse(message, { status: 200 });
  } catch {
    return new NextResponse('decrypt_failed', { status: 400 });
  }
}

/** Incoming staff message (POST): decrypt, verify, route the reply to the visitor. */
export async function POST(req: NextRequest) {
  // Always ack with "success" so WeCom doesn't retry-storm, even on our errors.
  if (!isWeComConfigured()) return new NextResponse('success');
  const p = req.nextUrl.searchParams;
  const msgSignature = p.get('msg_signature') ?? '';
  const timestamp = p.get('timestamp') ?? '';
  const nonce = p.get('nonce') ?? '';
  const raw = await req.text();
  const encrypt = xmlField(raw, 'Encrypt');
  if (!encrypt || signature(timestamp, nonce, encrypt) !== msgSignature) {
    return new NextResponse('success');
  }
  try {
    const { message, receiveId } = decrypt(encrypt);
    if (!receiveId || receiveId === wecom.corpId) {
      if (xmlField(message, 'MsgType') === 'text') {
        const fromUser = xmlField(message, 'FromUserName');
        const content = xmlField(message, 'Content');
        if (content) await routeStaffReply(fromUser, content);
      }
    }
  } catch {
    /* ack anyway */
  }
  return new NextResponse('success');
}

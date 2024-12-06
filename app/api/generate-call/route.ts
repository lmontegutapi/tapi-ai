import {  NextResponse } from 'next/server'
import { TwilioClient } from '@/clients/twilio'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 60;

export async function POST(req: Request) {
  const debtRecord = await req.json()

  console.log("debtRecord", debtRecord)

  if (!debtRecord.phoneNumber) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
  }
  
  const call = await TwilioClient.calls.create({
    to: `+${debtRecord.phoneNumber}`,
    method: 'POST',
    from: process.env.TWILIO_PHONE_NUMBER!,
    //url: "http://demo.twilio.com/docs/voice.xml"
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice-webhook`,
    //statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/call-status`
  })

  console.log("call ========>", call)

  await prisma.call.create({
    data: {
      id: call.sid,
      debtId: debtRecord.id,
      status: 'SCHEDULED'
    }
  })

  return NextResponse.json({ callSid: call.sid })
}
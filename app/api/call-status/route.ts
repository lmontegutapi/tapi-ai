import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CallStatus } from '@prisma/client'

export async function POST(req: Request) {
  const formData = await req.formData()
  const CallSid = formData.get('CallSid')
  const CallStatus = formData.get('CallStatus')
  const CallDuration = formData.get('CallDuration')
 
  await prisma.call.update({
    where: { id: CallSid as string },
    data: {
      status: mapCallStatus(CallStatus as string),
      duration: parseInt(CallDuration as string) || null
    }
  })
 
  return NextResponse.json({ success: true })
 }
 
 function mapCallStatus(status: string): CallStatus {
  switch(status) {
    case 'in-progress': return 'IN_PROGRESS'
    case 'completed': return 'COMPLETED' 
    case 'failed': return 'FAILED'
    case 'no-answer': return 'NO_ANSWER'
    default: return 'SCHEDULED'
  }
 }
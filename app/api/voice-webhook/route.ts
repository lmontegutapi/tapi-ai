import twilio from 'twilio'

export async function POST(req: Request) {
  const twiml = new twilio.twiml.VoiceResponse()

  twiml.gather({
    input: 'speech',
    language: 'es-MX',
    action: `${process.env.NEXT_PUBLIC_BASE_URL}/api/interactive-call`,
    method: 'POST'
  }).say({
    voice: 'Polly.Lupe',
    language: 'es-MX'
  }, 'Hola, ¿con quién tengo el gusto?')

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  })
}
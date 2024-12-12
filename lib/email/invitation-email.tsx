import { 
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Tailwind,
  Section,
  Link
} from '@react-email/components';

interface InvitationEmailProps {
  inviterName: string;
  organizationName: string;
  inviteLink: string;
}

const InvitationEmailTemplate = ({
  inviterName,
  organizationName,
  inviteLink,
}: InvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Te han invitado a unirte a {organizationName}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Invitación para unirte a <strong>{organizationName}</strong>
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Hola 👋
            </Text>
            
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{inviterName}</strong> te ha invitado a unirte a <strong>{organizationName}</strong> en la plataforma de Cobranzas AI.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Aceptar Invitación
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              O copia y pega este link en tu navegador:
              <br />
              <Link href={inviteLink} className="text-blue-600 break-all">
                {inviteLink}
              </Link>
            </Text>

            <Text className="text-gray-500 text-[12px] leading-[24px] mt-[32px]">
              Si no esperabas esta invitación, puedes ignorar este email.
              Este link de invitación expirará en 7 días.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvitationEmailTemplate;
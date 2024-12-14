import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface InvitationEmailProps {
  username?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  teamImage?: string;
  inviteLink?: string;
}

export const InvitationEmail = ({
  username,
  invitedByUsername,
  invitedByEmail,
  teamName,
  teamImage,
  inviteLink,
}: InvitationEmailProps) => {
  const previewText = `${invitedByUsername} te ha invitado a unirte a ${teamName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Únete a <strong>{teamName}</strong>
            </Heading>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Hola {username},
            </Text>
            
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{invitedByUsername}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {invitedByEmail}
              </Link>
              ) te ha invitado a unirte al equipo <strong>{teamName}</strong> en la plataforma de Cobranzas AI.
            </Text>

            <Section>
              {teamImage && (
                <Row>
                  <Column align="left">
                    <Img
                      className="rounded-full"
                      src={teamImage}
                      width="64"
                      height="64"
                      fetchPriority="high"
                    />
                  </Column>
                </Row>
              )}
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Aceptar Invitación
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              O copia y pega este link en tu navegador:{" "}
              <Link href={inviteLink} className="text-blue-600 no-underline break-all">
                {inviteLink}
              </Link>
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Esta invitación fue enviada a{" "}
              <span className="text-black">{username}</span>. Si no esperabas esta invitación, puedes ignorar este email.
              El link de invitación expirará en 7 días.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactInvitationEmail(props: InvitationEmailProps) {
  return <InvitationEmail {...props} />;
}

export default InvitationEmail;
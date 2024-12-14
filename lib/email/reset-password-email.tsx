import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
  Tailwind,
  Section,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  username?: string;
  resetLink?: string;
}

export const ResetPasswordEmail = ({
  username,
  resetLink,
}: ResetPasswordEmailProps) => {
  const previewText = `Restablece tu contraseña de TapFlow`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Restablece tu contraseña de <strong>TapFlow</strong>
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Hola {username},
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en TapFlow. 
              Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={resetLink}
              >
                Restablecer Contraseña
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              O copia y pega este link en tu navegador:{" "}
              <Link href={resetLink} className="text-blue-600 no-underline break-all">
                {resetLink}
              </Link>
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Si no solicitaste restablecer tu contraseña, por favor ignora este correo
              o contacta a soporte si tienes alguna inquietud.
              Este link expirará en 24 horas por seguridad.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactResetPasswordEmail(props: ResetPasswordEmailProps) {
  return <ResetPasswordEmail {...props} />;
}

export default ResetPasswordEmail; 
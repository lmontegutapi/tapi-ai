import { 
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Tailwind
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  organizationName: string;
}

export const WelcomeEmailTemplate = ({
  name,
  organizationName,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a {organizationName}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Bienvenido a <strong>{organizationName}</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hola {name},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              ¡Gracias por registrarte en nuestra plataforma de cobranzas inteligente!
              Estamos emocionados de ayudarte a optimizar tus procesos de cobranza.
            </Text>
            <Button
              className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3 my-[10px] mx-0"
              href="https://tapi-ai.vercel.app/dashboard"
            >
              Ir al Dashboard
            </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmailTemplate;
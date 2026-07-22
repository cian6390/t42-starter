import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text
} from '@react-email/components'

type WelcomeEmailProps = {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to T42</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {name}!</Heading>
          <Text style={paragraph}>
            Thanks for signing up. We&apos;re glad to have you.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px'
}

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a'
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848'
}

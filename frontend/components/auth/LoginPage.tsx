'use client'

import LoginPageContainer from './LoginPageContainer'
import AnimatedBackground from './AnimatedBackground'
import ModernLoginForm from './ModernLoginForm'

export default function LoginPage() {
  return (
    <LoginPageContainer
      backgroundComponent={<AnimatedBackground />}
      formComponent={<ModernLoginForm />}
    />
  )
}
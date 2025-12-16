import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/components/auth/LoginPage'
import { AuthProvider } from '@/lib/auth/AuthProvider'

// Mock the auth service
jest.mock('@/lib/auth/AuthService', () => ({
  getInstance: () => ({
    login: jest.fn(),
    isAuthenticated: jest.fn(() => false),
  }),
}))

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthContext = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  }

  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', () => {
    render(
      <MockAuthProvider>
        <LoginPage />
      </MockAuthProvider>
    )

    expect(screen.getByText('AI Agent Portal')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows validation for empty fields', async () => {
    render(
      <MockAuthProvider>
        <LoginPage />
      </MockAuthProvider>
    )

    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(usernameInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('updates input values when typing', () => {
    render(
      <MockAuthProvider>
        <LoginPage />
      </MockAuthProvider>
    )

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })

    expect(usernameInput.value).toBe('testuser')
    expect(passwordInput.value).toBe('testpass')
  })
})
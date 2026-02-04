import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Homepage from '../Components/HOMEPAGE/Homepage'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

const renderHomepage = (userData = null) => {
  if (userData) {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData))
  } else {
    mockLocalStorage.getItem.mockReturnValue(null)
  }
  
  return render(
    <BrowserRouter>
      <Homepage />
    </BrowserRouter>
  )
}

describe('Frontend and Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  test('renders homepage with correct title', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
  // The title and heart are rendered in separate nodes (<h1>GENNEURO <span>❤️</span>),
  // so assert them separately.
  expect(screen.getByText('GENNEURO')).toBeInTheDocument()
  expect(screen.getByText('❤️')).toBeInTheDocument()
    expect(screen.getByText('Digital Healthcare Solutions')).toBeInTheDocument()
  })

  test('redirects to login when no user data', () => {
    renderHomepage(null)
    
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('displays user welcome message when logged in', () => {
    const userData = { user_id: 1, name: 'John Doe' }
    renderHomepage(userData)
    
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument()
  })

  test('renders service operations when user is logged in ', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    expect(screen.getByText('Talk to AI Doctor')).toBeInTheDocument()
    expect(screen.getByText('Psychiatrists Near You')).toBeInTheDocument()
    expect(screen.getByText('Ophthalmologists Near You')).toBeInTheDocument()
    expect(screen.getByText('Diabetic Detection')).toBeInTheDocument()
  })

  test('handles logout correctly', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userData')
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('navigates to appointment finder', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    const appointmentButton = screen.getByText('Psychiatrists Near You')
    fireEvent.click(appointmentButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/appointmentfinder')
  })

  test('navigates to cart page', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    const cartButton = screen.getByText('Your Cart')
    fireEvent.click(cartButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/cartproduct/1')
  })

  test('navigates to orders page', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    const ordersButton = screen.getByText('Your Orders')
    fireEvent.click(ordersButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/citizenorderpage/1')
  })

  test('opens AI doctor in new window', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    const aiDoctorButton = screen.getByText('Talk to AI Doctor')
    fireEvent.click(aiDoctorButton)
    
    expect(global.open).toHaveBeenCalledWith('/mindmate')
  })

  test('opens diabetic detection in new window and loads the dataset to the model and preprocessed the given Image', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    const diabeticButton = screen.getByText('Diabetic Detection')
    fireEvent.click(diabeticButton)
    
    expect(global.open).toHaveBeenCalledWith('http://localhost:8501', '_blank')
  })

  test('renders online pharmacy section', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    expect(screen.getByText('Why Choose Us?')).toBeInTheDocument()
    expect(screen.getByText('Electronic Records')).toBeInTheDocument()
    expect(screen.getByText('Appointments')).toBeInTheDocument()
    expect(screen.getByText('Pharmacy')).toBeInTheDocument()
  })

  test('renders footer section', () => {
    const userData = { user_id: 1, name: 'Test User' }
    renderHomepage(userData)
    
    expect(screen.getByText('contact@medmanagesystem.com')).toBeInTheDocument()
    expect(screen.getByText('123 Health Street, Medical City')).toBeInTheDocument()
  })
})


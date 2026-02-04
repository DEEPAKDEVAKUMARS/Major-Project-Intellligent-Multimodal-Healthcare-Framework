import { useNavigate } from 'react-router-dom';

function Front() {
  const navigate = useNavigate();

  return (
    <div className='main-Con'>
      {/* Wave background elements */}
      
      

      {/* Fixed-position card */}
      <div className='small-Con'>
        <h1 className='heady-Home mb-5'>MINDMATE</h1>
        <button className='btn-Home mb-3' onClick={() => navigate('/login')}>Login</button>
        <button className='btn-Home2' onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
    </div>  
    
  );
}

export default Front;

import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function withRouter(Component) {
  return function WrapperComponent(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    
    return <Component {...props} navigate={navigate} location={location} params={params} />;
  };
}

import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">Mavericks</Link>
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/students">Students</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/exams">Exams</Link></li>
          <li><Link to="/reports">Reports</Link></li>
        </ul>
      </div>
    </nav>
  );
}
export default Navigation;
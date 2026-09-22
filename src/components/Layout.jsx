import { Outlet, NavLink } from "react-router-dom";

function link(isActive) {
  return isActive ? "on" : "";
}

function Layout() {
  return (
    <div>
      <header>
        <h1>Momentum</h1>
        <p className="tagline">Keep your job search moving.</p>
        <nav>
          <NavLink to="/" end className={({ isActive }) => link(isActive)}>Dashboard</NavLink>
          <NavLink to="/applications" className={({ isActive }) => link(isActive)}>Applications</NavLink>
          <NavLink to="/momentum" className={({ isActive }) => link(isActive)}>Momentum</NavLink>
          <NavLink to="/insights" className={({ isActive }) => link(isActive)}>Insights</NavLink>
          <NavLink to="/about" className={({ isActive }) => link(isActive)}>About</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>Momentum — a CodeOps Capstone project</p>
      </footer>
    </div>
  );
}

export default Layout;

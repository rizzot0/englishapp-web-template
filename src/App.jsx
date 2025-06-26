import logoCA from '/assets/images/CALogo.png';

export default function App() {
  return (
    <div className="app-container">
      {/* Logo corporativo */}
      <header style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0'}}>
        <img src={logoCA} alt="Logo Colegio Arauco" style={{height: 60}} />
        <h1 style={{margin: 0, fontSize: '1.5rem'}}>English App - Colegio Arauco</h1>
      </header>
    </div>
  );
}
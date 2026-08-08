import '../css/LandingPage.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    title: 'Escolha seu lado',
    text: 'Contratante ou freelancer — o ninho muda com você.',
  },
  {
    title: 'Monte o ninho',
    text: 'Portfólio, bio e serviços. O preview é o que o mundo vê.',
  },
  {
    title: 'Conecte',
    text: 'Explore o feed, salve profissionais e publique trabalho real.',
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleStart() {
    if (user) navigate('/home');
    else navigate('/authchoice');
  }

  return (
    <div className="landing-page">
      <div className="background-image" aria-hidden="true" />
      <Navbar />

      <main id="conteudo-principal" className="hero-content">
        <div className="hero-copy">
          <p className="hero-kicker">para criar e contratar</p>
          <h1>Sua carreira, em um único ninho</h1>
          <p className="hero-lead">
            Mostre seu trabalho, encontre clientes e organize a carreira — ou descubra freelancers e contrate com clareza.
          </p>

          <div className="hero-actions">
            <button type="button" className="hero-button" onClick={handleStart}>
              começar agora
            </button>
            <button type="button" className="hero-text-link" onClick={() => navigate('/home')}>
              explorar trabalhos
            </button>
          </div>
        </div>

        <section className="landing-steps" aria-label="Como o Nidus funciona">
          {STEPS.map((step) => (
            <article key={step.title} className="landing-step">
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;

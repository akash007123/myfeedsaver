import React from 'react';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Services from './components/Services';
import Projects from './components/Projects';
import Achievements from './components/Achievements';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-white">
      <Sidebar />
      <main className="md:ml-24">
        <Hero />
        <About />
        <Skills />
        <Services />
        <Projects />
        <Achievements />
        <Testimonials />
        <Blog />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}

export default App;
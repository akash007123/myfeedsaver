import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 text-center md:text-left"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Full Stack Developer
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Crafting digital experiences with code and creativity
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#contact" className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors">
                Get in Touch
              </a>
              <a href="#projects" className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors">
                View Work
              </a>
            </div>
            <div className="flex space-x-6 mt-8 justify-center md:justify-start">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <Github size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <Linkedin size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <Twitter size={24} />
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 mt-12 md:mt-0"
          >
            <img
              src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"
              alt="Developer"
              className="rounded-full w-64 h-64 md:w-96 md:h-96 object-cover mx-auto shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
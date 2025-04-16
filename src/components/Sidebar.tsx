import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, User, Briefcase, Mail, Code2, Rocket, Award, BookOpen, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', href: '#home' },
    { icon: User, label: 'About', href: '#about' },
    { icon: Code2, label: 'Skills', href: '#skills' },
    { icon: Briefcase, label: 'Projects', href: '#projects' },
    { icon: Rocket, label: 'Services', href: '#services' },
    { icon: Award, label: 'Achievements', href: '#achievements' },
    { icon: BookOpen, label: 'Blog', href: '#blog' },
    { icon: MessageSquare, label: 'Testimonials', href: '#testimonials' },
    { icon: Mail, label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg md:hidden hover:bg-gray-100 transition-colors"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isOpen || (isMounted && window.innerWidth >= 768)) && (
          <motion.nav
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 ${
              isOpen ? 'w-64' : 'w-24'
            } md:translate-x-0`}
          >
            <div className="flex flex-col h-full py-8">
              {/* <div className="px-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800">John Doe</h2>
                <p className="text-sm text-gray-600">Full Stack Developer</p>
              </div> */}

              <div className="flex-1 px-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-4 px-4 py-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors mb-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon size={20} />
                    <span className={`font-medium ${!isOpen && 'md:hidden'}`}>
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  © 2024 
                </p>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
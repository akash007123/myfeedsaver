import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code2, Globe, Server } from 'lucide-react';

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const services = [
    {
      icon: Code2,
      title: 'Frontend Development',
      description: 'Creating responsive and interactive user interfaces using modern frameworks and tools.',
    },
    {
      icon: Server,
      title: 'Backend Development',
      description: 'Building robust server-side applications and APIs with scalable architecture.',
    },
    {
      icon: Globe,
      title: 'Full Stack Solutions',
      description: 'Delivering end-to-end web applications with seamless integration.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-8">About Me</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://thispersonnotexist.org/downloadimage/Ac3RhdGljL2Z1bGxfYm9keS9zZWVkMTEzMTQuanBlZw=="
                alt="Profile"
                className="rounded-lg"
              />
            </div>
            <div>
              <p className="text-lg text-gray-600 mb-6">
                With over 5 years of experience in web development, I specialize in creating beautiful, functional, and user-friendly websites and applications. My passion lies in turning complex problems into simple, elegant solutions.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                I work with a wide range of technologies and keep myself updated with the latest industry trends and best practices.
              </p>
            </div>
          </div>

          <div className="mt-20">
            <h3 className="text-3xl font-bold text-center mb-12">What I Do</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-white p-6 rounded-lg shadow-lg"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <service.icon size={24} className="text-indigo-600" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{service.title}</h4>
                  <p className="text-gray-600">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
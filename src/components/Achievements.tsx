import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, Users, Coffee, Code2 } from 'lucide-react';

const Achievements = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const achievements = [
    {
      icon: Award,
      count: '15+',
      title: 'Awards Won',
      description: 'Recognition for excellence in web development and design',
    },
    {
      icon: Users,
      count: '120+',
      title: 'Happy Clients',
      description: 'Successful projects delivered to satisfied clients',
    },
    {
      icon: Code2,
      count: '100+',
      title: 'Projects Completed',
      description: 'From small websites to complex web applications',
    },
    {
      icon: Coffee,
      count: '5000+',
      title: 'Cups of Coffee',
      description: 'Fuel for creating amazing digital experiences',
    },
  ];

  const certifications = [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2024',
      image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Google Cloud Professional Developer',
      issuer: 'Google Cloud',
      date: '2023',
      image: 'https://images.unsplash.com/photo-1579403124614-197f69d8187b?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Meta Frontend Developer',
      issuer: 'Meta',
      date: '2023',
      image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section id="achievements" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-16">Achievements</h2>

          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{achievement.count}</h3>
                <h4 className="text-xl font-semibold text-gray-700 mb-2">{achievement.title}</h4>
                <p className="text-gray-600">{achievement.description}</p>
              </motion.div>
            ))}
          </div>

          <h3 className="text-3xl font-bold text-center mb-12">Certifications</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={cert.image}
                  alt={cert.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold mb-2">{cert.name}</h4>
                  <p className="text-gray-600 mb-2">{cert.issuer}</p>
                  <p className="text-sm text-gray-500">{cert.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Achievements;
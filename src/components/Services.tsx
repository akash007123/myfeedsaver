import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code2, Server, Database, Cloud, Smartphone, Lock, Rocket } from 'lucide-react';

const Services = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const services = [
    {
      icon: Code2,
      title: 'Frontend Development',
      description: 'Creating responsive and interactive user interfaces using modern frameworks like React, Vue, and Angular.',
      features: ['Responsive Design', 'UI/UX Implementation', 'Performance Optimization'],
    },
    {
      icon: Server,
      title: 'Backend Development',
      description: 'Building robust server-side applications and APIs with Node.js, Python, and Java.',
      features: ['API Development', 'Database Design', 'Server Management'],
    },
    {
      icon: Database,
      title: 'Database Architecture',
      description: 'Designing and implementing efficient database solutions for scalable applications.',
      features: ['Schema Design', 'Query Optimization', 'Data Migration'],
    },
    {
      icon: Cloud,
      title: 'Cloud Solutions',
      description: 'Deploying and managing applications on cloud platforms like AWS, Azure, and GCP.',
      features: ['Cloud Migration', 'Serverless Architecture', 'DevOps'],
    },
    {
      icon: Smartphone,
      title: 'Mobile Development',
      description: 'Creating cross-platform mobile applications using React Native and Flutter.',
      features: ['iOS Development', 'Android Development', 'App Store Deployment'],
    },
    {
      icon: Lock,
      title: 'Security Implementation',
      description: 'Implementing robust security measures and best practices in applications.',
      features: ['Authentication', 'Authorization', 'Data Encryption'],
    },
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-4">Services</h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Comprehensive web development solutions tailored to your needs. From concept to deployment,
            I deliver high-quality, scalable applications.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <service.icon size={28} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <Rocket size={16} className="text-indigo-600 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
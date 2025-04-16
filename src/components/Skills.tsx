import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Skills = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const skills = [
    { name: 'React', level: 90 },
    { name: 'TypeScript', level: 85 },
    { name: 'Node.js', level: 80 },
    { name: 'Python', level: 75 },
    { name: 'SQL', level: 85 },
    { name: 'AWS', level: 70 },
  ];

  const technologies = [
    'JavaScript', 'HTML5', 'CSS3', 'Git', 'Docker', 'MongoDB',
    'Redis', 'GraphQL', 'REST APIs', 'Webpack', 'Jest', 'CI/CD',
  ];

  return (
    <section id="skills" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-16">Skills & Expertise</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-8">Core Skills</h3>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-gray-600">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.level}%` } : {}}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-8">Technologies</h3>
              <div className="grid grid-cols-2 gap-4">
                {technologies.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4 text-center hover:bg-indigo-50 transition-colors"
                  >
                    <span className="font-medium">{tech}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
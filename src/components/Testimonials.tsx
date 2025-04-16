import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO at TechStart',
      image: 'https://thispersonnotexist.org/downloadimage/Ac3RhdGljL3dvbWFuL3NlZWQzNTU3Ni5qcGVn',
      content: 'Working with Akash was an absolute pleasure. His technical expertise and attention to detail transformed our vision into reality. The end result exceeded our expectations.',
      rating: 5,
    },
    {
      name: 'Vinayak Seth ',
      role: 'Founder & CEO',
      image: 'https://thispersonnotexist.org/downloadimage/Ac3RhdGljL21hbi9zZWVkNDc3MzYuanBlZw==',
      content: 'Akash ability to understand complex requirements and deliver elegant solutions is remarkable. His work significantly improved our application performance.',
      rating: 5,
    },
    {
      name: 'Dr. Shashank Bhargava',
      role: 'Dermotologist',
      image: 'https://thispersonnotexist.org/downloadimage/Ac3RhdGljL21hbi9zZWVkNDA5NDQuanBlZw==',
      content: 'An exceptional developer who brings both technical skill and creative insight to every project. The collaboration was seamless and the results were outstanding.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-4">Client Testimonials</h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Don't just take my word for it - here's what others have to say about working with me.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <blockquote className="text-gray-700 italic">
                  "{testimonial.content}"
                </blockquote>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a
              href="#contact"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Work With Me
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
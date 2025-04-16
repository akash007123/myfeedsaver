import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Clock } from 'lucide-react';

const Blog = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const posts = [
    {
      title: 'Building Scalable Web Applications with React',
      excerpt: 'Learn the best practices for building large-scale React applications that perform well and are maintainable.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
      date: '2024-03-01',
      readTime: '8 min read',
    },
    {
      title: 'Modern Backend Architecture Patterns',
      excerpt: 'Explore different architectural patterns for building robust and scalable backend systems.',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80',
      date: '2024-02-15',
      readTime: '10 min read',
    },
    {
      title: 'The Future of Web Development',
      excerpt: 'A look at emerging technologies and trends that will shape the future of web development.',
      image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
      date: '2024-02-01',
      readTime: '6 min read',
    },
  ];

  return (
    <section id="blog" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-16">Latest Blog Posts</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar size={16} className="mr-2" />
                    <span>{post.date}</span>
                    <Clock size={16} className="ml-4 mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 hover:text-indigo-600 transition-colors">
                    <a href="#">{post.title}</a>
                  </h3>
                  <p className="text-gray-600">{post.excerpt}</p>
                  <a
                    href="#"
                    className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Read More →
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
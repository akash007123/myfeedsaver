import  { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
// import emailjs from '@emailjs/browser';

const Contact = () => {
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
  
    setIsSubmitting(true);
    setSubmitStatus('idle');
  
    const formData = new FormData(formRef.current);
  
    try {
      const res = await fetch('https://fileupdatebackend.onrender.com/api/contact', {
        method: 'POST',
        body: formData, // send form data including file
      });
  
      const result = await res.json();
  
      if (result.success) {
        setSubmitStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'akashraikwar763@gmail.com',
      href: 'mailto:akashraikwar763@gmail.com',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+91-9685533878',
      href: 'tel:+919685533878',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Ujjain, MP',
      href: '#',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-16">Get in Touch</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <info.icon size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">{info.label}</h4>
                      <a
                        href={info.href}
                        className="text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        {info.value}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile
                  </label>
                  <input
                    type="number"
                    id="name"
                    name="mobile"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    File
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    required
                    className="w-full text-slate-500 font-medium text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-slate-500 rounded"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={20} />
                    </>
                  )}
                </button>
                {submitStatus === 'success' && (
                  <p className="text-green-600 text-center">Message sent successfully!</p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-red-600 text-center">Failed to send message. Please try again.</p>
                )}
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
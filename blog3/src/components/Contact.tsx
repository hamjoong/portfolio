import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="contact">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="contact-container single-column"
      >
        <div className="contact-text">
          <h2 className="section-title">Contact</h2>
          <p className="contact-intro">
            새로운 프로젝트 제안이나 협업 문의는 언제든 환영합니다.<br/>
            아래 채널을 통해 편하게 연락주세요.
          </p>
          
          <div className="contact-links">
            <a href="mailto:hamjoong@gmail.com" target='_blank' rel='noreferrer' className="contact-link-item">
              <div className="icon-box">
                <Mail size={24} />
              </div>
              <div className="link-info">
                <span>Email</span>
                <strong>your.email@example.com</strong>
              </div>
            </a>
            
            <a href="https://github.com/hamjoong" target="_blank" rel="noreferrer" className="contact-link-item">
              <div className="icon-box">
                <Github size={24} />
              </div>
              <div className="link-info">
                <span>GitHub</span>
                <strong>Project Repository</strong>
              </div>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;

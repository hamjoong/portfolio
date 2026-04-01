import React from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { Project } from '../types/Project';
import { PROJECTS } from '../constants/projects';

const ProjectCard: React.FC<Project> = ({ title, period, description, stack, problem, solution, links }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="project-card"
  >
    <div className="project-card-visual-header">
      <Code2 size={40} strokeWidth={1.5} />
    </div>
    <div className="project-card-info">
      <div className="project-card-header">
        <h3 className="project-card-title">{title}</h3>
        <span className="project-card-period">{period}</span>
      </div>
      <p className="project-card-description">{description}</p>
      <div className="project-card-tags">
        {stack.map((tag, idx) => (
          <span key={idx} className="project-card-tag">{tag}</span>
        ))}
      </div>
      <div className="project-card-details">
        <div className="project-card-detail-item">
          <strong>Problem:</strong>
          <p>{problem}</p>
        </div>
        <div className="project-card-detail-item">
          <strong>Solution:</strong>
          <p>{solution}</p>
        </div>
      </div>
      <div className="project-card-links">
        {links?.demo && <a href={links.demo} className="btn btn-primary btn-sm" target="_blank" rel="noreferrer">Live Demo</a>}
        {links?.github && <a href={links.github} className="btn btn-outline btn-sm" target="_blank" rel="noreferrer">GitHub</a>}
      </div>
    </div>
  </motion.div>
);

const Projects: React.FC = () => {
  return (
    <section id="projects" className="projects">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {PROJECTS.map((project, idx) => (
            <ProjectCard key={idx} {...project} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Projects;

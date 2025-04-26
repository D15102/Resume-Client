// import React from 'react';
import { FileText } from 'lucide-react';
import { useTheme } from "../context/ThemeContext";
import {motion} from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const templates = [
  {
    id: 1,
    name: 'Professional',
    description: 'Clean and modern design for corporate positions',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 2,
    name: 'Creative',
    description: 'Stand out with a unique layout for creative roles',
    image: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 3,
    name: 'Technical',
    description: 'Highlight technical skills and projects effectively',
    image: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?auto=format&fit=crop&q=80&w=400',
  }
];

const ResumeTemplates = () => {
  const { isLight } = useTheme();
  return (
    <motion.div 
    className={`w-full min-h-[calc(100vh-4.1rem)]
    ${isLight ? 'bg-white' : 'bg-zinc-600' }
    `}
    variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      
      <div className="max-w-7xl  mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className={`text-3xl font-bold mb-4
          ${ isLight ? 'text-gray-900' : 'text-zinc-300' }
          `}>
          Professional Resume Templates
        </h1>
        <p className="text-xl text-gray-600">
          Choose from our collection of ATS-friendly resume templates
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={template.image}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button className="bg-white text-gray-900 px-4 py-2 rounded-md flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Use Template
                </button>
              </div>
            </div>
            <div className={`p-6 h-full select-none
              ${ isLight ? 'bg-white' : 'bg-zinc-400' }
              `}>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 select-none">
                {template.name}
              </h3>
              <p className={` ${isLight ? 'text-gray-600' : 'text-zinc-800' } select-none`}>{template.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </motion.div>
  );
};

export default ResumeTemplates;
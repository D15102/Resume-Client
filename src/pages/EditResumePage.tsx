import { useRef, useState } from 'react';
import ResumeTemplate1 from '../components/ResumeTemplate1';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import {motion} from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const EditResumePage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const { isLight } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    summary: '',
    experience: '',
    education: '',
    pskill: [''],
  tskill: [''],
  jobtitle: '',
  });
  const handleListChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'pskill' | 'tskill',
    index: number
  ) => {
    const updatedList = [...formData[field]];
    updatedList[index] = e.target.value;
    setFormData({ ...formData, [field]: updatedList });
  };

  const addListItem = (field: 'pskill' | 'tskill') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeListItem = (field: 'pskill' | 'tskill', index: number) => {
    const updatedList = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedList });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resumeRef = useRef<HTMLDivElement>(null);

  // const handlePrint = useReactToPrint({
  //   content: () => resumeRef.current,
  //   documentTitle: ${formData.name || 'resume'},
  // });
  // const handlePrint = useReactToPrint(() => resumeRef.current);


  // const handlePrint = useReactToPrint({
  //   content: () => resumeRef.current ,  // ✅ cast to correct type
  //   documentTitle: ${formData.name || 'resume'},
  // })
  const handlePrint = () => {
    const printContents = resumeRef.current?.innerHTML;
  
    if (!printContents) {
      alert('There is nothing to print');
      return;
    }
  
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${formData.name || 'Resume'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1, h2, h3 { margin: 0; padding-bottom: 10px; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };
  
  
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
  
      const response = await fetch(`${serverUrl}/api/resumepage/resumepage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save resume');
      }
      
      toast.success('Resume saved successfully!');
      // alert('Resume saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save resume');
    }
  };
  

  return (
    <motion.div 
    className={`p-4 ${isLight ? 'bg-zinc-500' : 'bg-zinc-700'  } `}
    variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5 }}
    >
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4  rounded-l-md p-3
        ${ isLight ? 'bg-zinc-300' : 'bg-zinc-400' }
        `}>
        <form className="space-y-2   on">
          <input type='text' name="name" placeholder="Name" onChange={handleChange} className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`}/>
          <input type='text' name="jobtitle" placeholder="Job Title" onChange={handleChange} className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`} />
          <input type='email' name="email" placeholder="Email" onChange={handleChange} className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`} />
          <input type='number' name="phone" placeholder="Phone" min={0} minLength={10} maxLength={10} onChange={handleChange} className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`} />
          <textarea name="summary" placeholder="Summary" onChange={handleChange} className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`} />
          <textarea name="experience" placeholder="Experience" onChange={handleChange} className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`} />
          <textarea name="education" placeholder="Education" onChange={handleChange} className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`}/>
        
{/* // !   Add input fields for professional and technical skills */}
<div>
  <h3 className="font-semibold ml-3 text-[1.2rem]">Professional Skills</h3>
  {formData.pskill.map((skill, index) => (
    <div key={index} className="flex gap-2 mb-1">
      <input
        type="text"
        value={skill}
        onChange={(e) => handleListChange( e,'pskill', index) }
        className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`}
        placeholder={`Skill ${index + 1}`}
      />
      <button type="button" onClick={() => removeListItem('pskill', index)} className="bg-red-500 text-white px-2 rounded">×</button>
    </div>
  ))}
  <button type="button" onClick={() => addListItem('pskill')} className="text-indigo-600 font-bold text-[1rem] mt-1 ml-3 font-sans">+ Add Skill</button>
</div>

<div>
  <h3 className="font-semibold mt-2 ml-3 text-[1.2rem]">Technical Skills</h3>
  {formData.tskill.map((skill, index) => (
    <div key={index} className="flex gap-2 mb-1">
      <input
        type="text"
        value={skill}
        onChange={(e) => handleListChange(e, 'tskill', index)}
        className={`w-full ml-2 mt-3 text-[1.2rem] border-none p-2 rounded-md focus:ring-green-500 ring-[3px] focus:border-none focus:outline-none ${isLight ? 'bg-gray-500 text-white' : 'bg-gray-700 text-white' }`}
        placeholder={`Skill ${index + 1}`}
      />
      <button type="button" onClick={() => removeListItem('tskill', index)} className="bg-red-500 text-white px-2 rounded">×</button>
    </div>
  ))}
  <button type="button" onClick={() => addListItem('tskill')} className={`text-indigo-600 font-bold ml-3 text-[1rem] mt-1 font-sans`}>+ Add Skill</button>
</div>




          <div className="flex justify-around">
            <button type="button" onClick={() => handlePrint()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ">
              Download PDF
            </button>
            <button type="button" onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Save Resume
            </button>

            {/* <button type="button" onClick={handleDownloadPDF} className="bg-blue-600 text-white px-4 py-2 rounded">
  Download PDF
</button> */}

          </div>
        </form>

        <div className={`h-[100vh] shadow-md  p-2 rounded-md ${isLight ? 'bg-zinc-200 shadow-blue-500' : 'bg-zinc-500 shadow-emerald-500' }`}>
          <ResumeTemplate1 ref={resumeRef} formData={formData} />
        </div>
      </div>
    </motion.div>
  );
};

export default EditResumePage;
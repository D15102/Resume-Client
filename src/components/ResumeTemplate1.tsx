import { forwardRef } from 'react';
import { useTheme } from '../context/ThemeContext'; 

interface ResumeProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    summary: string;
    experience: string;
    education: string;
    pskill: string[];
    tskill: string[];
    jobtitle: string;
  };
}

const ResumeTemplate1 = forwardRef<HTMLDivElement, ResumeProps>(({ formData }, ref) => {
  const { isLight } = useTheme()
  return (
    <div ref={ref} className={`p-8 max-w-3xl mx-auto shadow-md rounded-md 
    ${isLight ? 'bg-white shadow-blue-500' : 'bg-zinc-800 shadow-emerald-400' }
    `}>
      <h1 className={`text-3xl font-bold text-center ${isLight ? 'text-blue-700' : 'text-green-500' } `}>{formData.name}</h1>
      <h2 className={`text-2xl font-bold text-center ${isLight ? 'text-gray-600' : 'text-zinc-400' }`}>{formData.jobtitle}</h2>

      <div className='flex justify-between mt-4'>
        <p className={`flex justify-between ${isLight ? 'text-gray-600' : 'text-zinc-300' }`}>{formData.email} </p>
        <p className={`flex justify-between ${isLight ? 'text-gray-600' : 'text-zinc-300' }`}> {formData.phone} </p>
      </div>
      <hr className="my-4 c" />
      <section>
        <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-600' : 'text-blue-500' }`}>Summary</h2>
        <p className={`text-1xl font-sans block ${isLight ? 'text-gray-600' : 'text-zinc-400' }`}>{formData.summary}</p>
      </section>
      <section className="mt-4">
        <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-600' : 'text-blue-500' }`}>Experience</h2>
        <p className={`text-1xl font-sans ${isLight ? 'text-gray-600' : 'text-zinc-400' }`}>{formData.experience}</p>
      </section>

      <section className="mt-4">
        <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-600' : 'text-blue-500' }`}>Education</h2>
        <p className={`block text-1xl font-sans ${isLight ? 'text-gray-600' : 'text-zinc-400' }`}>{formData.education}</p>
      </section>

      {/* <section className="mt-4">
        <h2 className="text-xl font-semibold text-gray-800">Professional Skill</h2>
        <p className='text-1xl font-sans'>{formData.pskill}</p>
      </section>
      <section className="mt-4">
        <h2 className="text-xl font-semibold text-gray-800">Technical Skill</h2>
        <p className='text-1xl font-sans'>{formData.tskill}</p>
      </section> */}

      <section className="mt-4 ">
        <h2 className={`"text-xl mt-4 font-semibold ${isLight ? 'text-gray-600' : 'text-blue-500' }`}> Skills</h2>
        <h3 className={`font-semibold ${isLight ? 'text-gray-600' : 'text-green-500' }`}>Professional Skills</h3>
        <ul className="list-disc ml-6">
          {formData.pskill.map((skill: string, index: number) => (
            <li key={index} className={`list-disc text-1xl font-sans block font-semibold ${isLight ? 'text-gray-600' : 'text-zinc-400' }`}>{skill}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h3 className={`font-semibold ${isLight ? 'text-gray-600' : 'text-blue-500' }`}>Technical Skills</h3>
        <ul className="list-disc ml-6">
          {formData.tskill.map((skill: string, index: number) => (
            <li key={index} className={`text-1xl font-sans block font-semibold ${isLight ? 'text-gray-600' : 'text-zinc-400' }`}>{skill}</li>
          ))}
        </ul>
      </section>


    </div>
  );
});

export default ResumeTemplate1;
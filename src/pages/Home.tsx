import { Upload, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const Home = () => {
  const { isLight } = useTheme();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5 }}
      className={`min-h-[calc(100vh-4.1rem)] ${
        isLight ? "bg-white" : "bg-gray-900"
      }`}
    >
      <div className={`max-w-7xl mx-auto px-4 py-12`}>
        <div className="text-center mb-16">
          <h1
            className={`text-4xl font-bold mb-4 ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            Optimize Your Resume <span className="text-blue-600">With AI</span>
          </h1>
          <p
            className={`text-xl max-w-2xl mx-auto ${
              isLight ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Get real-time ATS analysis, smart suggestions, and improve your
            chances of landing your dream job.
          </p>
          <Link
            to="/dashboard"
            className="mt-8 inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Link to="/dashboard">
            <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer select-none">
              <Upload className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
              <p className="text-gray-600">
                Upload your resume in PDF or DOCX format and get instant
                analysis
              </p>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer select-none">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">ATS Optimization</h3>
            <p className="text-gray-600">
              Get real-time feedback on ATS compatibility and optimization tips
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer select-none">
            <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-gray-600">
              Track your resume's performance and improvement over time
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

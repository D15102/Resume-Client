import { Upload, CheckCircle, TrendingUp, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * custom,
      duration: 0.5,
    },
  }),
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.2,
    },
  },
};

const Home = () => {
  const { isLight } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check for authentication and redirect to dashboard if needed
  useEffect(() => {
    // Check for auth_success flag (coming from Google auth)
    const authSuccess = sessionStorage.getItem('auth_success');
    const redirectToDashboard = sessionStorage.getItem('redirect_to_dashboard');

    if (isAuthenticated || authSuccess === 'true' || redirectToDashboard === 'true') {
      console.log('User is authenticated, redirecting to dashboard');
      // Clear flags
      sessionStorage.removeItem('auth_success');
      sessionStorage.removeItem('redirect_to_dashboard');
      // Navigate to dashboard
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <Upload className={`h-12 w-12 ${isLight ? "text-primary-light" : "text-primary-dark"} mb-4`} />,
      title: "Easy Upload",
      description: "Upload your resume in PDF or DOCX format and get instant analysis",
      link: "/dashboard",
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-green-600 mb-4" />,
      title: "ATS Optimization",
      description: "Get real-time feedback on ATS compatibility and optimization tips",
      link: "/dashboard",
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />,
      title: "Smart Analytics",
      description: "Track your resume's performance and improvement over time",
      link: "/dashboard",
    },
  ];

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
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className={`p-4 rounded-full ${isLight ? "bg-blue-100" : "bg-blue-900"}`}>
              <FileText className={`h-12 w-12 ${isLight ? "text-primary-light" : "text-primary-dark"}`} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            Optimize Your Resume <span className={isLight ? "text-primary-light" : "text-primary-dark"}>With AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-lg md:text-xl max-w-2xl mx-auto mb-8 ${
              isLight ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Get real-time ATS analysis, smart suggestions, and improve your
            chances of landing your dream job.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              to="/dashboard"
              className={`inline-block px-6 py-3 md:px-8 md:py-4 rounded-md text-white font-medium transition-colors duration-200 ${
                isLight
                  ? "bg-primary-light hover:bg-blue-600"
                  : "bg-primary-dark hover:bg-emerald-600"
              }`}
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index + 1}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className={`p-6 rounded-lg shadow-md cursor-pointer select-none transition-all duration-200 ${
                isLight ? "bg-white hover:bg-gray-50" : "bg-gray-800 hover:bg-gray-750"
              }`}
              onClick={() => window.location.href = feature.link}
            >
              {feature.icon}
              <h3 className={`text-xl font-semibold mb-2 ${
                isLight ? "text-gray-900" : "text-white"
              }`}>
                {feature.title}
              </h3>
              <p className={`${
                isLight ? "text-gray-600" : "text-gray-300"
              }`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className={`mt-16 p-6 md:p-8 rounded-lg ${
            isLight ? "bg-gray-50" : "bg-gray-800"
          }`}
        >
          <h2 className={`text-2xl font-bold mb-4 ${
            isLight ? "text-gray-900" : "text-white"
          }`}>
            Why Choose SkillSync?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className={`mb-4 ${
                isLight ? "text-gray-700" : "text-gray-300"
              }`}>
                Our AI-powered resume analysis tool helps you stand out in the job market by:
              </p>
              <ul className={`list-disc pl-5 space-y-2 ${
                isLight ? "text-gray-700" : "text-gray-300"
              }`}>
                <li>Identifying keywords that match job descriptions</li>
                <li>Providing actionable suggestions to improve your resume</li>
                <li>Analyzing your resume's ATS compatibility score</li>
                <li>Helping you create professional, tailored resumes</li>
              </ul>
            </div>
            <div>
              <p className={`mb-4 ${
                isLight ? "text-gray-700" : "text-gray-300"
              }`}>
                With SkillSync, you can:
              </p>
              <ul className={`list-disc pl-5 space-y-2 ${
                isLight ? "text-gray-700" : "text-gray-300"
              }`}>
                <li>Upload and analyze your existing resume</li>
                <li>Create new resumes using our templates</li>
                <li>Get personalized improvement suggestions</li>
                <li>Track your progress over time</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;

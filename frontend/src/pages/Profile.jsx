import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Save, Briefcase, GraduationCap, Award, User, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import { motion } from 'framer-motion';

const Profile = () => {
  const { profile, loading, updateProfileData } = useAuth();
  
  const [targetJob, setTargetJob] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  // Sync state with profile loaded from context
  useEffect(() => {
    if (profile) {
      setTargetJob(profile.targetJob || '');
      setSummary(profile.summary || '');
      setSkills(profile.skills || []);
      setExperience(profile.experience || []);
      setEducation(profile.education || []);
    }
  }, [profile]);

  if (loading) return <LoadingState message="Loading candidate profile..." />;

  // Handler to add skill tags
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Handler to remove skill tags
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Experience array manipulation
  const handleAddExperience = () => {
    setExperience([...experience, { company: '', role: '', duration: '', description: '' }]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  // Education array manipulation
  const handleAddEducation = () => {
    setEducation([...education, { institution: '', degree: '', graduationYear: new Date().getFullYear() }]);
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  // Save changes
  const handleSave = async () => {
    setStatus({ type: '', message: '' });
    setSaving(true);

    const result = await updateProfileData({
      targetJob,
      summary,
      skills,
      experience,
      education
    });

    if (result.success) {
      setStatus({ type: 'success', message: 'Profile saved successfully!' });
      // Reset status after 3 seconds
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } else {
      setStatus({ type: 'error', message: result.message });
    }
    setSaving(false);
  };

  return (
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-darkbg-700 pb-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Candidate Profile</h1>
          <p class="text-sm text-gray-400 mt-1">Configure your targets, experience, and skills to train the AI interviewer</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          class="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-all shadow-md disabled:opacity-50 text-sm"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {status.message && (
        <div class={`p-4 rounded-xl border flex items-center gap-3 text-sm transition-all
          ${status.type === 'success' 
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-500'
          }
        `}>
          {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Grid Settings Layout */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Profile Info */}
        <div class="lg:col-span-1 space-y-6">
          {/* Target Placement Card */}
          <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
            <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <User class="text-primary-500" size={18} /> Target Job
            </h3>
            
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Target Job Title</label>
              <input
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="e.g. Frontend Engineer, Data Scientist"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 dark:text-gray-100"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Professional Bio</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of your skills and placement targets..."
                class="w-full h-32 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 dark:text-gray-100 resize-none"
              />
            </div>
          </div>

          {/* Skill Tagging Card */}
          <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
            <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Award class="text-primary-500" size={18} /> Core Skills
            </h3>

            {/* Input Tag */}
            <form onSubmit={handleAddSkill} class="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. React)"
                class="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs text-gray-800 dark:text-gray-100"
              />
              <button
                type="submit"
                class="p-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              >
                <Plus size={18} />
              </button>
            </form>

            {/* Tags Container */}
            <div class="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs text-primary-500 font-semibold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    class="p-0.5 rounded-full hover:bg-primary-500/20 text-primary-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <p class="text-xs text-gray-400 italic">No skills listed yet. Add skills or upload resume.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Experience and Education Arrays */}
        <div class="lg:col-span-2 space-y-6">
          {/* Work History */}
          <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Briefcase class="text-primary-500" size={18} /> Work Experience
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                class="flex items-center gap-1 text-xs font-bold text-primary-500 hover:underline"
              >
                <Plus size={14} /> Add Experience
              </button>
            </div>

            <div class="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} class="p-4 rounded-xl border border-gray-100 dark:border-darkbg-700 bg-gray-50/50 dark:bg-darkbg-900/30 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    class="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        placeholder="Google"
                        class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Job Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                        placeholder="Software Engineer Intern"
                        class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-3">
                    <div class="space-y-1">
                      <label class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                        placeholder="June 2023 - August 2023"
                        class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Description of Work</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        placeholder="Worked on containerizing web solutions with Docker, reducing deployment cycle times by 15%..."
                        class="w-full h-20 px-3 py-2 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-gray-800 dark:text-gray-100 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {experience.length === 0 && (
                <p class="text-xs text-gray-400 italic text-center py-4">No work history added. Add manually or upload resume.</p>
              )}
            </div>
          </div>

          {/* Education History */}
          <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <GraduationCap class="text-primary-500" size={18} /> Education
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                class="flex items-center gap-1 text-xs font-bold text-primary-500 hover:underline"
              >
                <Plus size={14} /> Add Education
              </button>
            </div>

            <div class="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} class="p-4 rounded-xl border border-gray-100 dark:border-darkbg-700 bg-gray-50/50 dark:bg-darkbg-900/30 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    class="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="space-y-1 md:col-span-2">
                      <label class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Institution Name</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                        placeholder="Stanford University"
                        class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        placeholder="B.Tech in CS"
                        class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="space-y-1">
                      <label class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Graduation Year</label>
                      <input
                        type="number"
                        value={edu.graduationYear}
                        onChange={(e) => handleUpdateEducation(idx, 'graduationYear', parseInt(e.target.value) || new Date().getFullYear())}
                        class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {education.length === 0 && (
                <p class="text-xs text-gray-400 italic text-center py-4">No education entries added. Add manually or upload resume.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

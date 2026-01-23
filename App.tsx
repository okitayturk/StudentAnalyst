import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import ExamEntry from './components/ExamEntry';
import Calculators from './components/Calculators';
import ExamDetails from './components/ExamDetails';
import HighSchoolScores from './components/HighSchoolScores';
import QuestionTracking from './components/QuestionTracking';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/exam-entry" element={<ExamEntry />} />
          <Route path="/question-tracking" element={<QuestionTracking />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/exam/:id" element={<ExamDetails />} />
          <Route path="/high-school-scores" element={<HighSchoolScores />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
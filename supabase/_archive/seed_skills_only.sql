-- Add skills to the skills table if they don't exist
INSERT INTO skills (name, category, description) VALUES
  ('JavaScript', 'Technical', 'JavaScript programming language'),
  ('TypeScript', 'Technical', 'TypeScript programming language'),
  ('React', 'Technical', 'React framework'),
  ('Python', 'Technical', 'Python programming language'),
  ('Public Speaking', 'Soft Skills', 'Public speaking and presentation skills'),
  ('Circuit Design', 'Technical', 'Electronic circuit design'),
  ('Arduino', 'Technical', 'Arduino programming and hardware'),
  ('Data Analysis', 'Technical', 'Data analysis and visualization'),
  ('Machine Learning', 'Technical', 'Machine learning and AI'),
  ('Video Editing', 'Creative', 'Video editing and production'),
  ('CAD Design', 'Technical', 'Computer-aided design'),
  ('Budget Management', 'Business', 'Financial planning and budgeting'),
  ('Node.js', 'Technical', 'Node.js runtime'),
  ('SQL', 'Technical', 'SQL database queries'),
  ('Git', 'Technical', 'Version control with Git'),
  ('Project Management', 'Business', 'Project planning and management'),
  ('UI/UX Design', 'Creative', 'User interface and experience design'),
  ('Leadership', 'Soft Skills', 'Team leadership and management'),
  ('Problem Solving', 'Soft Skills', 'Analytical and problem-solving skills'),
  ('Communication', 'Soft Skills', 'Effective communication skills')
ON CONFLICT (name) DO NOTHING;
-- Insert sample universities
INSERT INTO universities (name, domain, created_at, updated_at) VALUES
  ('Stanford University', 'stanford.edu', NOW(), NOW()),
  ('Massachusetts Institute of Technology', 'mit.edu', NOW(), NOW()),
  ('Harvard University', 'harvard.edu', NOW(), NOW()),
  ('University of California, Berkeley', 'berkeley.edu', NOW(), NOW()),
  ('University of Michigan', 'umich.edu', NOW(), NOW()),
  ('University of Texas at Austin', 'utexas.edu', NOW(), NOW()),
  ('Georgia Institute of Technology', 'gatech.edu', NOW(), NOW()),
  ('University of Washington', 'uw.edu', NOW(), NOW()),
  ('University of Illinois Urbana-Champaign', 'illinois.edu', NOW(), NOW()),
  ('Carnegie Mellon University', 'cmu.edu', NOW(), NOW()),
  ('University of California, Los Angeles', 'ucla.edu', NOW(), NOW()),
  ('University of Southern California', 'usc.edu', NOW(), NOW()),
  ('New York University', 'nyu.edu', NOW(), NOW()),
  ('Columbia University', 'columbia.edu', NOW(), NOW()),
  ('University of Pennsylvania', 'upenn.edu', NOW(), NOW()),
  ('Cornell University', 'cornell.edu', NOW(), NOW()),
  ('Duke University', 'duke.edu', NOW(), NOW()),
  ('Northwestern University', 'northwestern.edu', NOW(), NOW()),
  ('University of Chicago', 'uchicago.edu', NOW(), NOW()),
  ('Rice University', 'rice.edu', NOW(), NOW()),
  ('Syracuse University', 'syr.edu', NOW(), NOW())
ON CONFLICT (domain) DO NOTHING;

-- Insert sample skills with categories
INSERT INTO skills (name, category, description, is_verified, created_at) VALUES
  -- Technical Skills
  ('JavaScript', 'technical', 'Programming language for web development', true, NOW()),
  ('Python', 'technical', 'General-purpose programming language', true, NOW()),
  ('React', 'technical', 'JavaScript library for building user interfaces', true, NOW()),
  ('TypeScript', 'technical', 'Typed superset of JavaScript', true, NOW()),
  ('Java', 'technical', 'Object-oriented programming language', true, NOW()),
  ('SQL', 'technical', 'Database query language', true, NOW()),
  ('Git', 'technical', 'Version control system', true, NOW()),
  ('AWS', 'technical', 'Amazon Web Services cloud platform', true, NOW()),
  ('Docker', 'technical', 'Container platform', true, NOW()),
  ('Machine Learning', 'technical', 'AI and data science', true, NOW()),
  
  -- Leadership Skills
  ('Project Management', 'leadership', 'Planning and executing projects', true, NOW()),
  ('Team Leadership', 'leadership', 'Leading and motivating teams', true, NOW()),
  ('Public Speaking', 'leadership', 'Presenting to audiences', true, NOW()),
  ('Event Planning', 'leadership', 'Organizing events and activities', true, NOW()),
  ('Mentoring', 'leadership', 'Guiding and developing others', true, NOW()),
  
  -- Creative Skills
  ('Graphic Design', 'creative', 'Visual communication and design', true, NOW()),
  ('Content Writing', 'creative', 'Creating written content', true, NOW()),
  ('Video Editing', 'creative', 'Post-production video work', true, NOW()),
  ('UI/UX Design', 'creative', 'User interface and experience design', true, NOW()),
  ('Photography', 'creative', 'Capturing and editing photos', true, NOW()),
  
  -- Analytical Skills
  ('Data Analysis', 'analytical', 'Interpreting and analyzing data', true, NOW()),
  ('Research', 'analytical', 'Conducting systematic investigation', true, NOW()),
  ('Financial Analysis', 'analytical', 'Analyzing financial data', true, NOW()),
  ('Market Research', 'analytical', 'Understanding market trends', true, NOW()),
  ('Statistical Analysis', 'analytical', 'Statistical methods and tools', true, NOW()),
  
  -- Interpersonal Skills
  ('Communication', 'interpersonal', 'Effective verbal and written communication', true, NOW()),
  ('Teamwork', 'interpersonal', 'Working effectively in teams', true, NOW()),
  ('Networking', 'interpersonal', 'Building professional relationships', true, NOW()),
  ('Conflict Resolution', 'interpersonal', 'Resolving disputes and disagreements', true, NOW()),
  ('Customer Service', 'interpersonal', 'Serving and supporting customers', true, NOW())
ON CONFLICT (name) DO NOTHING;
'use client';

import { 
  Building, 
  Clock, 
  MapPin, 
  Calendar,
  User,
  GraduationCap,
  ChevronRight,
  MoreVertical,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  Briefcase,
  MessageSquare,
  X,
  Sparkles
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  CardFooter,
  Metadata,
  MetadataGroup,
  SkillTag,
  SkillsGroup,
  Badge,
  Avatar
} from './Card';

// Example 1: Project Card
export function ProjectCardExample() {
  const project = {
    name: 'Mobile App Development',
    organization: {
      name: 'Tech Club',
      logo_url: undefined,
      verified: true,
    },
    match_score: 85,
    application_deadline: '2025-07-15',
    required_commitment_hours: '10-15',
    is_remote: false,
    location: 'Campus',
    required_skills: ['React Native', 'TypeScript', 'UI/UX Design', 'Git', 'Testing'],
    matched_skills: ['React Native', 'TypeScript', 'Git'],
    is_saved: false,
  };

  return (
    <Card 
      variant="clickable" 
      className="max-w-md"
      onClick={() => console.log('Card clicked')}
    >
      <CardHeader
        icon={Building}
        action={
          project.match_score >= 70 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-neon-green/10 rounded-full">
              <Sparkles className="h-3 w-3 text-neon-green" />
              <span className="text-xs font-medium text-neon-green">
                {project.match_score}%
              </span>
            </div>
          )
        }
      >
        <div className="flex items-center gap-2">
          <CardSubtitle>{project.organization.name}</CardSubtitle>
          {project.organization.verified && (
            <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
          )}
        </div>
        <CardTitle size="lg">{project.name}</CardTitle>
      </CardHeader>

      <CardBody>
        <MetadataGroup>
          <Metadata icon={Calendar}>
            Apply by July 15
          </Metadata>
          <Metadata icon={Clock}>
            {project.required_commitment_hours}h/week
          </Metadata>
          <Metadata icon={MapPin} className="col-span-2">
            {project.is_remote ? 'Remote' : project.location}
          </Metadata>
        </MetadataGroup>

        <SkillsGroup label="Skills Needed" maxVisible={4} totalCount={project.required_skills.length}>
          {project.required_skills.slice(0, 4).map((skill) => (
            <SkillTag
              key={skill}
              variant={project.matched_skills.includes(skill) ? 'matched' : 'required'}
            >
              {skill}
            </SkillTag>
          ))}
        </SkillsGroup>
      </CardBody>

      <CardFooter>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Save clicked');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                     bg-transparent text-dark-muted hover:text-white 
                     border border-dark-border hover:bg-dark-bg
                     text-sm font-medium transition-all"
          >
            <Bookmark className="h-4 w-4" />
            Save
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Pass clicked');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                     bg-transparent text-dark-muted hover:text-white 
                     border border-dark-border hover:bg-dark-bg
                     text-sm font-medium transition-all"
          >
            <X className="h-4 w-4" />
            Pass
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Example 2: Member Card (Grid View)
export function MemberCardExample() {
  const member = {
    id: '1',
    user: {
      id: '1',
      full_name: 'Sarah Johnson',
      avatar_url: undefined,
      skills: ['React', 'Node.js', 'Python', 'Data Analysis', 'Machine Learning'],
      year_of_study: 'Junior',
      major: 'Computer Science',
    },
    role: 'tech_lead',
    joined_at: '2024-09-01',
  };

  return (
    <Card variant="clickable" className="max-w-sm">
      <div className="absolute top-4 right-4 z-10">
        <button className="p-2 rounded-lg bg-dark-surface/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <CardBody className="text-center">
        <div className="flex flex-col items-center mb-4">
          <Avatar
            size="lg"
            fallback="SJ"
            status="online"
            className="mb-4"
          />
          <CardTitle size="lg">{member.user.full_name}</CardTitle>
          <Badge variant="info" className="mt-2">
            Tech Lead
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-400">
          <Metadata icon={GraduationCap} className="justify-center">
            {member.user.major}
          </Metadata>
          <Metadata icon={User} className="justify-center">
            {member.user.year_of_study}
          </Metadata>
          <Metadata icon={Calendar} className="justify-center">
            Joined 3 months ago
          </Metadata>
        </div>

        <SkillsGroup className="mt-4" maxVisible={4} totalCount={member.user.skills.length}>
          {member.user.skills.slice(0, 4).map((skill) => (
            <SkillTag key={skill} size="xs">
              {skill}
            </SkillTag>
          ))}
        </SkillsGroup>
      </CardBody>

      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-dark-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-2">
          <button className="flex-1 p-2 bg-dark-surface/80 backdrop-blur-sm rounded-lg hover:bg-dark-elevated transition-colors flex items-center justify-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4" />
            Message
          </button>
          <button className="flex-1 p-2 bg-dark-surface/80 backdrop-blur-sm rounded-lg hover:bg-dark-elevated transition-colors flex items-center justify-center gap-2 text-sm">
            <Briefcase className="w-4 h-4" />
            Assign
          </button>
        </div>
      </div>
    </Card>
  );
}

// Example 3: Role Card
export function RoleCardExample() {
  const role = {
    id: '1',
    title: 'Marketing Director',
    description: 'Lead marketing initiatives and brand strategy',
    required_skills: ['Marketing Strategy', 'Social Media', 'Content Creation', 'Analytics'],
    current_holder: {
      id: '1',
      full_name: 'Alex Chen',
      year_of_study: 'Senior',
    },
    term_end_date: '2025-12-31',
  };

  const candidates = [
    { user: { id: '2', full_name: 'Maria Garcia' }, match_score: 92, ready: true },
    { user: { id: '3', full_name: 'John Smith' }, match_score: 85, ready: true },
    { user: { id: '4', full_name: 'Emma Wilson' }, match_score: 78, ready: false },
  ];

  const readyCandidates = candidates.filter(c => c.ready);

  return (
    <Card variant="warning" clickable>
      <CardHeader
        action={
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">
              6 months left
            </span>
          </div>
        }
      >
        <CardTitle size="xl">{role.title}</CardTitle>
        <CardSubtitle>{role.description}</CardSubtitle>
      </CardHeader>

      <CardBody>
        {/* Current Holder */}
        <div className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg">
          <Avatar size="sm" fallback="AC" />
          <div className="flex-1">
            <p className="font-medium">{role.current_holder.full_name}</p>
            <p className="text-sm text-gray-400">{role.current_holder.year_of_study}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Term ends</p>
            <p className="text-sm font-medium">Dec 2025</p>
          </div>
        </div>

        {/* Required Skills */}
        <SkillsGroup label="Required Skills">
          {role.required_skills.map((skill) => (
            <SkillTag key={skill} size="xs">
              {skill}
            </SkillTag>
          ))}
        </SkillsGroup>
      </CardBody>

      <CardFooter>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neon-green" />
            <span className="text-sm">
              <span className="font-medium text-neon-green">{readyCandidates.length}</span>
              {' '}ready candidate{readyCandidates.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Candidate Avatars */}
        <div className="mt-3 flex -space-x-2">
          {candidates.slice(0, 4).map((candidate, index) => (
            <Avatar
              key={candidate.user.id}
              size="xs"
              fallback={candidate.user.full_name.split(' ').map(n => n[0]).join('')}
              className={candidate.ready ? 'ring-2 ring-neon-green' : ''}
              style={{ zIndex: 4 - index }}
            />
          ))}
          {candidates.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-dark-surface flex items-center justify-center text-xs text-gray-400 border-2 border-dark-bg">
              +{candidates.length - 4}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// Example 4: Task Card
export function TaskCardExample() {
  const task = {
    id: '1',
    title: 'Design new landing page',
    description: 'Create a modern, responsive landing page for the upcoming campaign',
    project: 'Website Redesign',
    priority: 'high',
    due_date: '2025-07-10',
    assigned_to: [
      { id: '1', name: 'Sarah Johnson' },
      { id: '2', name: 'Mike Chen' },
    ],
    required_skills: ['UI/UX Design', 'Figma', 'Responsive Design'],
    progress: 65,
  };

  return (
    <Card variant="clickable">
      <CardHeader
        action={
          <Badge variant={task.priority === 'high' ? 'error' : 'info'} size="xs">
            {task.priority.toUpperCase()}
          </Badge>
        }
      >
        <CardSubtitle>{task.project}</CardSubtitle>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>

      <CardBody>
        <p className="text-sm text-gray-400">{task.description}</p>

        <MetadataGroup columns={1}>
          <Metadata icon={Calendar}>
            Due {new Date(task.due_date).toLocaleDateString()}
          </Metadata>
          <Metadata icon={Users}>
            {task.assigned_to.map(a => a.name).join(', ')}
          </Metadata>
        </MetadataGroup>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="font-medium">{task.progress}%</span>
          </div>
          <div className="w-full bg-dark-surface rounded-full h-2">
            <div 
              className="bg-neon-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        <SkillsGroup>
          {task.required_skills.map((skill) => (
            <SkillTag key={skill} size="xs">
              {skill}
            </SkillTag>
          ))}
        </SkillsGroup>
      </CardBody>
    </Card>
  );
}

// Example 5: Minimal List Card
export function ListCardExample() {
  return (
    <Card variant="clickable" size="sm">
      <div className="flex items-center gap-4">
        <Avatar size="md" fallback="JD" status="away" />
        
        <div className="flex-1 min-w-0">
          <CardTitle>John Doe</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
            <span>Senior • Computer Science</span>
            <span>3 projects</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="xs">Active</Badge>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Card>
  );
}

// Example 6: Stats Card
export function StatsCardExample() {
  return (
    <Card glassVariant="elevated">
      <CardHeader icon={Target} iconClassName="text-neon-green">
        <CardTitle size="sm">Open Positions</CardTitle>
      </CardHeader>
      
      <div className="mt-4">
        <p className="text-3xl font-bold text-neon-green">12</p>
        <p className="text-sm text-gray-400 mt-1">3 critical roles</p>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-neon-coral">↑ 20%</span>
        <span className="text-gray-400">from last month</span>
      </div>
    </Card>
  );
}

// Export all examples
export const CardExamples = {
  ProjectCard: ProjectCardExample,
  MemberCard: MemberCardExample,
  RoleCard: RoleCardExample,
  TaskCard: TaskCardExample,
  ListCard: ListCardExample,
  StatsCard: StatsCardExample,
};
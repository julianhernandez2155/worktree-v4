'use client';

import { 
  Users,
  Mail,
  Link2,
  MessageSquare,
  QrCode,
  Copy,
  Check,
  ChevronRight,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { createClient } from '@/lib/supabase/client';


export default function OrgInviteWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('org');
  const projectId = searchParams.get('project');
  
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [emails, setEmails] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [invitesSent, setInvitesSent] = useState(0);
  const [orgName, setOrgName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (orgId) {
      generateInviteLink();
      fetchOrgDetails();
    }
  }, [orgId]);

  const fetchOrgDetails = async () => {
    if (!orgId) {return;}
    
    const { data } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();
    
    if (data) {
      setOrgName(data.name);
    }
  };

  const generateInviteLink = async () => {
    if (!orgId) {return;}
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {return;}

    // Generate a unique invite code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    
    // Create invitation record
    await supabase
      .from('invitations')
      .insert({
        inviter_id: user.id,
        invitee_email: '', // Will be filled when used
        organization_id: orgId,
        invitation_code: code
      });

    // Generate the invite link
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/join/${code}`;
    setInviteLink(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmails = async () => {
    if (!emails.trim()) {return;}
    
    setLoading(true);
    const emailList = emails.split(/[,\n]/).map(e => e.trim()).filter(e => e);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('No user found');}

      // Create invitation records for each email
      const invitations = emailList.map(email => ({
        inviter_id: user.id,
        invitee_email: email,
        organization_id: orgId,
        invitation_code: inviteCode
      }));

      await supabase
        .from('invitations')
        .insert(invitations);

      setInvitesSent(emailList.length);
      setEmails('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('No user found');}

      // Update onboarding progress
      await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: { 
            path_selected: true,
            org_setup: true,
            first_project: true,
            invitations_sent: true
          },
          completion_percentage: 100
        })
        .eq('user_id', user.id);

      // Mark onboarding as complete
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      // Navigate to organization dashboard
      router.push(`/dashboard/org/${orgId}`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const inviteTemplates = {
    email: `Hi team,\n\nI'm setting up our new workspace on Worktree to better manage our projects and see everyone's skills.\n\nPlease join using this link: ${inviteLink}\n\nThis will help us:\n- Know who has what skills\n- Assign tasks more effectively\n- Track our projects better\n\nThanks!\n${orgName} Leadership`,
    
    slack: `Hey @channel! 👋\n\nJoin our Worktree workspace to help with projects: ${inviteLink}\n\nTakes 30 seconds and helps us match skills to tasks!`,
    
    groupchat: `Join our Worktree! ${inviteLink}\n\nQuick signup to help with ${orgName} projects 🚀`
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-neon-green" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Build Your Team</h1>
          <p className="text-gray-400">Invite members to unlock your organization's potential</p>
        </div>

        {/* Goal Card */}
        <GlassCard className="p-6 mb-6 bg-gradient-to-r from-neon-green/10 to-neon-blue/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Goal: Invite 5+ Members</h3>
            <Trophy className="w-6 h-6 text-neon-green" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-neon-green flex-shrink-0" />
              <div>
                <p className="font-medium">Unlock Skills Directory</p>
                <p className="text-sm text-gray-400">See what skills your members have</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-neon-blue flex-shrink-0" />
              <div>
                <p className="font-medium">Get Organization Health Score</p>
                <p className="text-sm text-gray-400">Track skill coverage and project velocity</p>
              </div>
            </div>
          </div>

          {invitesSent > 0 && (
            <div className="mt-4 p-3 bg-dark-surface rounded-lg">
              <p className="text-sm text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-neon-green">{invitesSent}/5 invites sent</p>
            </div>
          )}
        </GlassCard>

        {/* Invite Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Share Link */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Link2 className="w-5 h-5 text-neon-blue" />
              <h3 className="font-semibold">Share Link</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-dark-surface rounded-lg font-mono text-sm break-all">
                {inviteLink || 'Generating...'}
              </div>
              
              <NeonButton
                fullWidth
                variant="secondary"
                onClick={handleCopyLink}
                icon={copiedLink ? <Check /> : <Copy />}
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </NeonButton>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">or use code</p>
                <p className="text-2xl font-mono font-bold text-neon-green">{inviteCode}</p>
              </div>
            </div>
          </GlassCard>

          {/* Email Invites */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-neon-green" />
              <h3 className="font-semibold">Email Invites</h3>
            </div>
            
            <div className="space-y-3">
              <textarea
                className="input-field h-24 resize-none"
                placeholder="Enter emails separated by commas or new lines..."
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
              />
              
              <NeonButton
                fullWidth
                variant="secondary"
                onClick={handleSendEmails}
                loading={loading}
                disabled={!emails.trim()}
                icon={<Mail />}
              >
                Send Invites
              </NeonButton>
            </div>
          </GlassCard>
        </div>

        {/* Message Templates */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-neon-purple" />
            <h3 className="font-semibold">Message Templates</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(inviteTemplates).map(([platform, template]) => (
              <div key={platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize">{platform}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(template);
                      // Show feedback
                    }}
                    className="text-xs text-neon-purple hover:text-neon-purple/80"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-3 bg-dark-surface rounded-lg text-sm text-gray-400 whitespace-pre-wrap">
                  {template}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <NeonButton
            variant="ghost"
            onClick={() => handleComplete()}
          >
            Skip for now
          </NeonButton>
          
          <NeonButton
            fullWidth
            onClick={handleComplete}
            disabled={invitesSent < 5}
            icon={<ChevronRight />}
            iconPosition="right"
          >
            {invitesSent >= 5 ? 'Complete Setup' : `Send ${5 - invitesSent} more invites`}
          </NeonButton>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          You can always invite more members from your organization dashboard
        </p>
      </div>
    </div>
  );
}
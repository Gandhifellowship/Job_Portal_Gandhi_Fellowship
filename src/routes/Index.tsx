import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Users, ArrowRight, Shield, Microscope, Info } from 'lucide-react';

const PORTAL_STEPS = [
  'Log in to the NEST/Gandhi Fellowship Job Portal.',
  'Click on "View Open Positions" on the landing page.',
  'Search for roles using job titles or domains of interest.',
  'Select an Active job post and click "View Details."',
  'Review the job description and all role-related information carefully.',
  'To apply, click the "Apply" button on the right side of the page.',
  'Complete the application form accurately and click "Submit Application."',
  'Fellows are advised to maintain a record of roles applied to and download/save the Job Description (JD) for reference.',
  'Partner organizations will share candidate selection updates with the NEST team.',
  'The NEST team will communicate application status via email and/or through this portal.',
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: 'Can Fellows apply only to organizations onboarded by NEST through this platform?', a: 'Yes. This portal features opportunities exclusively from organizations onboarded by the NEST team.' },
  { q: 'How many positions or organizations can I apply to?', a: 'Fellows are encouraged to apply to only one position per organization. For details on the total number of applications allowed through this portal, please refer to the Placement Guidelines.' },
  { q: 'I have applied to an organization through this portal. Do I need to email my CV separately to the HR team?', a: 'No. Once you have submitted your application through the platform, there is no need to send your CV separately to the organization.' },
  { q: 'Will I receive an email confirmation after submitting an application through this portal?', a: 'No. Once your application is submitted, it is accessible only to the admin team. Fellows are advised to maintain a personal record of the positions and organizations they have applied to.' },
  { q: 'How can I view the location and remuneration details for a role?', a: 'Click on the respective job role to access key details, including location and remuneration. A downloadable PDF with comprehensive information about the position will also be available.' },
  { q: 'How many organizations will be onboarded for Batch-17 placements?', a: 'There is no fixed number of participating organizations. New organizations may be onboarded throughout the placement season. Fellows are advised to apply only to roles for which they are eligible and strongly aligned.' },
  { q: 'I am unsure about applying for a particular role. Who should I reach out to?', a: 'Fellows are encouraged to first connect with their assigned FPC member. You may also seek guidance from your PL/PM or peer group. If the query remains unresolved, it should be escalated to the respective Big Bet Placement SPOC through the FPC member.' },
  { q: 'How will I be informed about my application status after applying for a position?', a: 'The NEST team will update you on your application status through this portal and/or via email. Fellows are advised to regularly check both their official and personal email accounts.' },
];

const Index = () => {
  const [portalPopoverOpen, setPortalPopoverOpen] = useState(false);
  const [faqPopoverOpen, setFaqPopoverOpen] = useState(false);
  const [rolesPopoverOpen, setRolesPopoverOpen] = useState(false);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const faqOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const faqCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rolesOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rolesCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleTriggerMouseEnter = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current && clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
    openTimeoutRef.current = setTimeout(() => setPortalPopoverOpen(true), 400);
  };
  const handleTriggerMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    closeTimeoutRef.current = setTimeout(() => setPortalPopoverOpen(false), 150);
  };
  const handleContentMouseEnter = () => {
    clearCloseTimeout();
    setPortalPopoverOpen(true);
  };
  const handleContentMouseLeave = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setPortalPopoverOpen(false), 100);
  };

  const handleFaqTriggerMouseEnter = () => {
    if (faqOpenTimeoutRef.current) clearTimeout(faqOpenTimeoutRef.current);
    if (faqCloseTimeoutRef.current) {
      clearTimeout(faqCloseTimeoutRef.current);
      faqCloseTimeoutRef.current = null;
    }
    faqOpenTimeoutRef.current = setTimeout(() => setFaqPopoverOpen(true), 400);
  };
  const handleFaqTriggerMouseLeave = () => {
    if (faqOpenTimeoutRef.current) {
      clearTimeout(faqOpenTimeoutRef.current);
      faqOpenTimeoutRef.current = null;
    }
    faqCloseTimeoutRef.current = setTimeout(() => setFaqPopoverOpen(false), 150);
  };
  const handleFaqContentMouseEnter = () => {
    if (faqCloseTimeoutRef.current) {
      clearTimeout(faqCloseTimeoutRef.current);
      faqCloseTimeoutRef.current = null;
    }
    setFaqPopoverOpen(true);
  };
  const handleFaqContentMouseLeave = () => {
    faqCloseTimeoutRef.current = setTimeout(() => setFaqPopoverOpen(false), 100);
  };

  const clearRolesCloseTimeout = () => {
    if (rolesCloseTimeoutRef.current) {
      clearTimeout(rolesCloseTimeoutRef.current);
      rolesCloseTimeoutRef.current = null;
    }
  };
  const handleRolesTriggerMouseEnter = () => {
    if (rolesOpenTimeoutRef.current) clearTimeout(rolesOpenTimeoutRef.current);
    if (rolesCloseTimeoutRef.current) {
      clearTimeout(rolesCloseTimeoutRef.current);
      rolesCloseTimeoutRef.current = null;
    }
    rolesOpenTimeoutRef.current = setTimeout(() => setRolesPopoverOpen(true), 400);
  };
  const handleRolesTriggerMouseLeave = () => {
    if (rolesOpenTimeoutRef.current) {
      clearTimeout(rolesOpenTimeoutRef.current);
      rolesOpenTimeoutRef.current = null;
    }
    rolesCloseTimeoutRef.current = setTimeout(() => setRolesPopoverOpen(false), 150);
  };
  const handleRolesContentMouseEnter = () => {
    clearRolesCloseTimeout();
    setRolesPopoverOpen(true);
  };
  const handleRolesContentMouseLeave = () => {
    rolesCloseTimeoutRef.current = setTimeout(() => setRolesPopoverOpen(false), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-secondary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-accent-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-secondary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white shadow-2xl">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header with Logo and Admin Button */}
            <div className="flex items-center justify-between mb-8 md:mb-16 gap-4">
              {/* Logo */}
              <Link to="/" className="group flex-shrink-0">
                <div className="bg-white rounded-lg px-2 py-2 md:px-4 md:py-3 shadow-md">
                  <img 
                    src="/gandhi-fellowship-logo.png" 
                    alt="Gandhi Fellowship Logo" 
                    className="h-12 md:h-20 lg:h-24 group-hover:scale-105 transition-transform duration-200"
                    style={{ aspectRatio: 'auto' }}
                  />
                </div>
              </Link>
              
              {/* Admin Button */}
              <Link 
                to="/admin/login" 
                className="flex items-center space-x-1 md:space-x-2 text-white/90 hover:text-white transition-colors duration-200 flex-shrink-0"
              >
                <Shield className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-lg font-medium hidden sm:inline">Admin</span>
              </Link>
            </div>
            
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                Career Support
              </h1>
              <p className="text-xl opacity-95 mb-10 max-w-3xl mx-auto leading-relaxed">
                Take your first step to kick start your impact journey
              </p>
              
              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent-600 text-white font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <Link to="/jobs">
                    <Briefcase className="h-6 w-6 mr-3" />
                    View Open Positions
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-primary-700">
            Crossroad Support
          </h2>
          <p className="text-xl text-primary-600 max-w-2xl mx-auto">
            Powered by NEST, this platform supports Gandhi Fellowship community  in exploring opportunities, applying to on-boarded organizations, and navigating the career support process with clarity and confidence.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Popover open={portalPopoverOpen} onOpenChange={setPortalPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="cursor-pointer outline-none"
                onMouseEnter={handleTriggerMouseEnter}
                onMouseLeave={handleTriggerMouseLeave}
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 border border-primary-200 bg-white h-full">
                  <CardHeader className="pb-6">
                    <div className="h-16 w-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-primary-700 mb-3 flex items-center gap-2">
                      How Does The Portal Works
                      <Info className="h-4 w-4 text-primary-400 shrink-0" aria-hidden />
                    </CardTitle>
                    <CardDescription className="text-primary-600 leading-relaxed">
                      Familiarize yourself with the tech-enabled career support process for a smooth and efficient experience.
                    </CardDescription>
                    <p className="text-xs text-primary-400 mt-3 sm:mt-4">
                      Hover or tap to see steps
                    </p>
                  </CardHeader>
                </Card>
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={12}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-[calc(100vw-2rem)] max-w-lg p-0 rounded-xl border-2 border-primary-200 bg-white shadow-xl"
              onMouseEnter={handleContentMouseEnter}
              onMouseLeave={handleContentMouseLeave}
            >
              <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-t-xl px-5 py-4 border-b border-primary-200">
                <h3 className="text-lg font-bold text-primary-800">How Does The Portal Works</h3>
                <p className="text-sm text-primary-600 mt-0.5">Follow these steps for a smooth experience</p>
              </div>
              <ScrollArea className="h-[min(70vh,420px)]">
                <ol className="list-decimal list-inside space-y-3 px-5 py-4 text-sm text-primary-700 leading-relaxed">
                  {PORTAL_STEPS.map((step, i) => (
                    <li key={i} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <a
            href="https://kefindia-my.sharepoint.com/:f:/g/personal/evaristo_fernandes_gandhifellowship_org/IgADl6T0VGHpRqGqSSb5DqFjAXsJQ1soMcSn61amZQIUFI8?e=DTZn5P"
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
          >
            <Card className="group hover:shadow-2xl transition-all duration-300 border border-secondary-200 bg-white h-full">
              <CardHeader className="pb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-secondary-500 to-secondary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-primary-700 mb-3">Placement Guidelines</CardTitle>
                <CardDescription className="text-primary-600 leading-relaxed">
                  Placement guidelines co-developed by NEST and the Fellow Placement Committee ensure a clear and structured process.
                </CardDescription>
              </CardHeader>
            </Card>
          </a>

          <Popover open={rolesPopoverOpen} onOpenChange={setRolesPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="cursor-pointer outline-none"
                onMouseEnter={handleRolesTriggerMouseEnter}
                onMouseLeave={handleRolesTriggerMouseLeave}
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 border border-accent-200 bg-white h-full">
                  <CardHeader className="pb-6">
                    <div className="h-16 w-16 bg-gradient-to-br from-accent-500 to-accent-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <ArrowRight className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-primary-700 mb-3 flex items-center gap-2">
                      Roles & Support System
                      <Info className="h-4 w-4 text-accent-500 shrink-0" aria-hidden />
                    </CardTitle>
                    <CardDescription className="text-primary-600 leading-relaxed">
                      To ensure the fellows don't feel left out or confused, we have developed a support system that will help them during the job application process.
                    </CardDescription>
                    <p className="text-xs text-primary-400 mt-3 sm:mt-4">
                      Hover or tap to see details
                    </p>
                  </CardHeader>
                </Card>
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="bottom"
              sideOffset={12}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-[calc(100vw-2rem)] max-w-lg p-0 rounded-xl border-2 border-accent-200 bg-white shadow-xl"
              onMouseEnter={handleRolesContentMouseEnter}
              onMouseLeave={handleRolesContentMouseLeave}
            >
              <div className="bg-gradient-to-br from-accent-50 to-accent-100/50 rounded-t-xl px-5 py-4 border-b border-accent-200">
                <h3 className="text-lg font-bold text-primary-800">Roles & Support System</h3>
                <p className="text-sm text-primary-600 mt-0.5">FPC, SPOCs, NEST team and fellow responsibilities</p>
              </div>
              <ScrollArea className="h-[min(70vh,440px)]">
                <div className="px-5 py-4 text-sm text-primary-700 space-y-4">
                  <section>
                    <h4 className="font-semibold text-primary-800 mb-1.5">1) Fellow Placement Committee (FPC)</h4>
                    <p className="mb-1.5"><span className="font-medium">1.1)</span> A dedicated Fellow Placement Committee (FPC) comprising 34 Fellows across all Big Bets has been established. Each FPC member supports 10–14 Fellows during the placement process.</p>
                    <p><span className="font-medium">1.2)</span> For any queries or concerns related to applications on this job portal, Fellows are requested to first reach out to their assigned FPC member.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-primary-800 mb-1.5">2) Big Bet Placement SPOCs</h4>
                    <p className="mb-2"><span className="font-medium">2.1)</span> A team of five Placement SPOCs representing each Big Bet will oversee applications and support the placement process:</p>
                    <ul className="list-none space-y-1 pl-2 mb-2">
                      <li><span className="font-medium">a)</span> ABC: Robin Raj – Program Manager - robin.raj@gandhifelowship.org</li>
                      <li><span className="font-medium">b)</span> DBC: Suman Banerjee – Senior Program Manager - suman.banerjee@piramalswasthya.org</li>
                      <li><span className="font-medium">c)</span> IBC: Priyanka Sarkar – Senior Program Manager - priyanka.sarkar@piramalswasthya.org</li>
                      <li><span className="font-medium">d)</span> PSL: Ankit Maurya – Program Manager - ankit.maurya@gandhifellowship.org</li>
                      <li><span className="font-medium">e)</span> SoH: Bhavya Gautam – Program Manager - Bhavya.Gautam@piramalswasthya.org</li>
                    </ul>
                    <p><span className="font-medium">2.2)</span> Queries unresolved by FPC members will be escalated to the respective Big Bet SPOC through the FPC member only.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-primary-800 mb-1.5">3) NEST Placement Team</h4>
                    <p className="mb-2"><span className="font-medium">3.1)</span> The NEST team will coordinate and oversee the overall placement process under the leadership of the Program Director, Qasim K Naqash:</p>
                    <ul className="list-none space-y-1 pl-2 mb-2">
                      <li><span className="font-medium">a)</span> Evaristo Fernandes – Program Manager - evaristo.fernandes@gandhifellowship.org</li>
                      <li><span className="font-medium">b)</span> Richa Mahamunkar – Program Leader - richa.manohar@gandhifellowship.org</li>
                      <li><span className="font-medium">c)</span> Varsha Sarkar – Program Manager - varsha.sarkar@gandhifellowship.org</li>
                      <li><span className="font-medium">d)</span> Farea Khanam – Program Leader - farea.khanam1@gandhifellowship.org</li>
                    </ul>
                    <p><span className="font-medium">3.2)</span> Issues unresolved at the FPC and Big Bet levels will be escalated to the NEST team via the respective Big Bet SPOC.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-primary-800 mb-1.5">4) Fellow Responsibilities</h4>
                    <p className="mb-1.5"><span className="font-medium">4.1)</span> Fellows must adhere to the application limits outlined in the Placement Guidelines.</p>
                    <p><span className="font-medium">4.2)</span> Fellows are advised to maintain a personal record of jobs applied to and download/save Job Descriptions (JDs) for future reference.</p>
                  </section>
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 text-white overflow-hidden shadow-2xl">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-brand-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <Microscope className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
              Frequently Asked Questions
            </h2>
            <p className="text-xl opacity-95 mb-10 leading-relaxed">
              Find quick answers to common questions about the career support process and platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Popover open={faqPopoverOpen} onOpenChange={setFaqPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent-600 text-white font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                    onMouseEnter={handleFaqTriggerMouseEnter}
                    onMouseLeave={handleFaqTriggerMouseLeave}
                  >
                    <Microscope className="h-6 w-6 mr-3" />
                    Find Answers
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="center"
                  side="top"
                  sideOffset={16}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="w-[calc(100vw-2rem)] max-w-2xl p-0 rounded-xl border-2 border-primary-200 bg-white shadow-xl"
                  onMouseEnter={handleFaqContentMouseEnter}
                  onMouseLeave={handleFaqContentMouseLeave}
                >
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50/80 rounded-t-xl px-5 py-4 border-b border-primary-200">
                    <h3 className="text-lg font-bold text-primary-800">Frequently Asked Questions</h3>
                    <p className="text-sm text-primary-600 mt-0.5">Quick answers about the career support process and platform</p>
                  </div>
                  <ScrollArea className="h-[min(75vh,480px)]">
                    <div className="px-5 py-4 space-y-5">
                      {FAQ_ITEMS.map((item, i) => (
                        <div key={i} className="border-b border-primary-100 pb-4 last:border-0 last:pb-0">
                          <p className="text-sm font-semibold text-primary-800 mb-1.5">Q: {item.q}</p>
                          <p className="text-sm text-primary-700 leading-relaxed pl-0">A: {item.a}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

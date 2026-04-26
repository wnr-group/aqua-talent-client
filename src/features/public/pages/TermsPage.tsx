

import PublicNavbar from '@/components/layout/PublicNavbar'
import Card, { CardContent } from '@/components/common/Card'

// T&C to be added in content section by legal team.
const TermsPage = () => {
  const sections = [
    {
        title: 'Acceptance of Terms',
        content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'
    },
    {
        title: 'Use of Platform',
        content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'

    },
    {
        title: 'User Accounts',
        content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'

    },
    {
        title: 'Privacy',
        content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'

    },
    {
        title: 'Intellectual Property',
        content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'

    },
    {
        title: 'Prohibited Conduct',
        content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'

    },
    {
        title: 'Limitation of Liability',
        content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'

    },
    {
      title: 'Governing Law',
      content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'
    },
    {
      title: 'Contact',
      content:'[PLACEHOLDER - content to be added by legal team] additional legal clauses will be inserted here to ensure full compliance with regional and international digital service regulations.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-gray-500 font-medium mb-6">Last updated: April 24, 2026</p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Welcome to Aquatalentz. Please read our terms and conditions carefully as they contain important information regarding your legal rights, remedies, and obligations.
            </p>
          </div>

          {/* Main Content Card */}
          <Card className="shadow-lg border-gray-100 overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-12">
              {sections.map((section, index) => (
                <section key={index} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  <div className="pl-12 space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </section>
              ))}
            </CardContent>
          </Card>

         
        </div>
      </main>
    </div>
  )
}

export default TermsPage

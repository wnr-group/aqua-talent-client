import { PageContainer } from '@/components/layout';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card' ; 
import { Users, Building2, Globe } from 'lucide-react'; 

export default function AboutPage() {
  return (
    <PageContainer showSidebar={false}>
      {/* Hero Section */}
      <section className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Who We Are</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          AquaTalentz is dedicated to bridging the gap between emerging talent and industry leaders. 
          Our mission is to empower the next generation of professionals through seamless opportunities.
        </p>
      </section>

      {/* Our Mission */}
      <section className="mb-20">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-teal-50 rounded-full mb-4">
            <Globe className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="max-w-2xl text-gray-500">
            To create a transparent ecosystem where skills meet demand, 
            ensuring that every student finds their right fit and every company finds its ideal talent.
          </p>
        </div>
      </section>

      {/* What We Do*/}
      <section className="mb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card hover>
            <CardHeader>
              <Users className="w-6 h-6 text-teal-500 mb-2" />
              <CardTitle>For Students</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find internships and job opportunities that align with your skills and career aspirations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <Building2 className="w-6 h-6 text-teal-500 mb-2" />
              <CardTitle>For Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access a vetted pool of talented individuals ready to contribute to your company's growth.
              </CardDescription>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <Globe className="w-6 h-6 text-teal-500 mb-2" />
              <CardTitle>The Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A centralized hub designed for efficiency, transparency, and seamless communication.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Have questions?</h2>
        <p className="text-gray-500 mb-6">We'd love to hear from you.</p>
        <a 
          href="mailto:info@aquatalentz.com" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
        >
          Reach us at info@aquatalentz.com
        </a>
      </section>
    </PageContainer>
  );
}
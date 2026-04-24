import { PageContainer } from '@/components/layout';
import Card from '@/components/common/Card';
import { 
    ShieldCheck, 
    Lock, 
    CreditCard, 
    HardDrive, 
    Mail, 
    FileCheck, 
    Globe, 
    AlertTriangle, 
    FileSearch
 } from 'lucide-react';

export default function SecurityPage() {
    return (
        <PageContainer showSidebar={false}>
            {/* Hero Section */}
            <section className="mb-16 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-blue-600 mb-6">Your Security is Our Priority</h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                    At AquaTalentz, we employ industry-standard security practices to ensure your data,
                    documents, and payments remain safe and confidential.
                </p>
            </section>

            {/* What We Protect - Key Pillars */}
            <h1 className="text-4xl text-center font-bold text-gray-900 mb-6">
                What We <span className="text-blue-600">Protect</span>
            </h1>
            <section className="mb-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: <Lock />, title: "Account Security", desc: "Identity protection & encryption" },
                    { icon: <HardDrive />, title: "Data Storage", desc: "Encrypted cloud databases" },
                    { icon: <CreditCard />, title: "Payment Security", desc: "Secure Transactions" },
                    { icon: <FileCheck />, title: "File Storage", desc: "Secure document management" },
                ].map((item, index) => (
                    <Card key={index} className="text-center">
                        <div className="flex justify-center mb-4 text-blue-600">{item.icon}</div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
                    </Card>
                ))}
            </section>

            {/* Technical Measures Section */}
            <section className="mb-20">
                <div className="flex flex-col items-center mb-12">
                    <div className="p-3 bg-blue-50 rounded-2xl mb-4">
                        <ShieldCheck className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Technical Measures</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Authentication & Passwords */}
                    <div className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-lg hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-600 rounded-xl ">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Authentication & Passwords</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            We use <span className="font-semibold text-blue-600">bcrypt</span> for password hashing,
                            ensuring your credentials are never stored in plain text. Authentication is handled
                            via <span className="font-semibold text-blue-600">JWT (JSON Web Tokens)</span> with strict expiry windows.
                        </p>
                    </div>

                    {/* Payment Handling */}
                    <div className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-lg hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-600 rounded-xl">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Payment Handling</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            All transactions are processed through <span className="font-semibold text-blue-600">Razorpay</span>.
                            Your card details never touch our servers, ensuring your financial data is handled securely.
                        </p>
                    </div>

                    {/* Secure File Storage */}
                    <div className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-lg hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-600 rounded-xl">
                                <HardDrive className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Secure File Storage</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Resumes and media files are stored in <span className="font-semibold text-blue-600">AWS S3</span> using
                            private buckets, isolated from the application servers to prevent unauthorized access.
                        </p>
                    </div>

                    {/* Encryption in Transit */}
                    <div className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-lg hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-600 rounded-xl">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Encryption in Transit</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Our platform enforces <span className="font-semibold text-blue-600">HTTPS</span> for all communications,
                            meaning your data is encrypted the moment it leaves your browser.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-20 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Penetration Testing */}
                <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FileSearch className="w-5 h-5 text-gray-500" />
                        Penetration Testing
                    </h3>
                    <p className="text-sm text-gray-500 italic leading-relaxed">
                        [PLACEHOLDER] — Results of our latest security assessment will be published here.
                        We conduct regular vulnerability scans to maintain platform integrity.
                    </p>
                </div>

                {/* Responsible Disclosure */}
                <div className="p-8 rounded-2xl bg-blue-600 border border-blue-100">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-white" />
                        Report a Security Issue
                    </h3>
                    <p className="text-sm text-white mb-4 leading-relaxed">
                        Found a bug? We appreciate the help of the security community. Please report any
                        vulnerabilities to our team at:
                    </p>
                    <a
                        href="mailto:security@aquatalentz.com"
                        className="inline-flex items-center gap-2 text-white font-semibold hover:underline"
                    >
                        <Mail className="w-4 h-4" />
                        security@aquatalentz.com
                    </a>
                </div>
            </section>
        </PageContainer>
    );
}
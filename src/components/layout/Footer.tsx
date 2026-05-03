import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Mail, Send } from 'lucide-react';
import Logo from '../common/Logo';

export default function Footer() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Contact from ${formData.name}`);
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        );
        window.open(`mailto:support@aquatalentz.com?subject=${subject}&body=${body}`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <footer className="bg-slate-900 border-t border-white/10 pt-12 pb-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Left Column: Brand */}
                    <div className="space-y-4">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0">
                            <Logo size="md" />
                        </Link>
                        <p className="text-sm text-blue-100 max-w-xs">
                            Bridging the gap between emerging talent and industry leaders.
                        </p>
                        <p className="text-xs text-blue-200 pt-4 font-medium">
                            © 2026 Aquatalentz. All rights reserved.
                        </p>
                    </div>

                    {/* Middle Column: Quick Links */}
                    <div className="md:pl-10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                            Platform
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="text-blue-100 hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/about" className="text-blue-100 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/terms" className="text-blue-100 hover:text-white transition-colors">Terms</Link></li>
                            <li><Link to="/security" className="text-blue-100 hover:text-white transition-colors">Security</Link></li>
                        </ul>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="bg-white p-6 rounded-xl border border-blue-400/20 shadow-lg">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" /> Contact Us
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                            <a href="mailto:support@aquatalentz.com" className="text-blue-600 hover:underline">support@aquatalentz.com</a>
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                required
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <Input
                                required
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <textarea
                                required
                                name="message"
                                rows={3}
                                placeholder="Message"
                                value={formData.message}
                                onChange={handleChange}
                                className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-colors duration-150 resize-none"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                rightIcon={<Send className="w-4 h-4" />}
                            >
                                Send Message
                            </Button>
                        </form>
                    </div>

                </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
  <p className="text-xs text-gray-400">
    Powered by{' '}
    <a
      href="https://www.wnradvisory.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline hover:text-gray-300 transition-colors"
    >
      WnR Group
    </a>
  </p>
</div>
        </footer>
    );
}

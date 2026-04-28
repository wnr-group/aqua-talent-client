import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

export default function Footer() {
   
    return (
        <footer className="bg-slate-900 border-t border-white/10 pt-12 pb-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-col">
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
                            <li><Link to="/terms" className="text-blue-100 hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/security" className="text-blue-100 hover:text-white transition-colors">Security</Link></li>
                        </ul>
                    </div>

{/* Right Column: Contact Form */}
                    <div className="flex flex-col gap-2">
                         <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                            Contact
                        </h3>
  <div className="flex gap-1">
    <span className="text-sm text-white">General enquiries:</span>
    <a href="mailto:info@aquatalentz.com" className="text-sm text-[--glow-teal] hover:underline">
      info@aquatalentz.com
    </a>
  </div>
  
  <div className="flex gap-1">
    <span className="text-sm text-white">Support:</span>
    <a href="mailto:support@aquatalentz.com" className="text-sm text-[--glow-teal] hover:underline">
      support@aquatalentz.com
    </a>
  </div>
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
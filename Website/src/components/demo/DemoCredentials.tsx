import { Copy, Check, User, Building2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

interface DemoCredential {
    email: string;
    password: string;
    role: 'student' | 'owner';
    name: string;
    description: string;
}

const demoCredentials: DemoCredential[] = [
    {
        email: 'demo.student@studentnest.com',
        password: 'Demo@123',
        role: 'student',
        name: 'Demo Student',
        description: 'Primary student account with full features'
    },
    {
        email: 'demo.owner@studentnest.com',
        password: 'Demo@123',
        role: 'owner',
        name: 'Demo Owner',
        description: 'Primary owner account with 3 properties'
    }
];

export default function DemoCredentials() {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1a1a1b] to-[#2a2a2b] border border-[#3a3a3b] rounded-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30 mb-4">
                        <Lock className="w-4 h-4 text-[#7c3aed]" />
                        <span className="text-sm text-[#7c3aed] font-medium">Demo Login Credentials</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Quick Login Access</h2>
                    <p className="text-[#a1a1aa]">Use these credentials to test the platform instantly</p>
                </div>

                {/* Credentials Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {demoCredentials.map((cred, index) => (
                        <div
                            key={index}
                            className="bg-[#0a0a0b] border border-[#2a2a2b] rounded-xl p-6 hover:border-[#3a3a3b] transition-colors"
                        >
                            {/* Role Badge */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${cred.role === 'student'
                                            ? 'bg-[#7c3aed]/20 border border-[#7c3aed]/40'
                                            : 'bg-[#3b82f6]/20 border border-[#3b82f6]/40'
                                        }`}
                                >
                                    {cred.role === 'student' ? (
                                        <User className={`w-5 h-5 text-[#7c3aed]`} />
                                    ) : (
                                        <Building2 className={`w-5 h-5 text-[#3b82f6]`} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{cred.name}</h3>
                                    <p className="text-xs text-[#a1a1aa]">{cred.description}</p>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="mb-3">
                                <label htmlFor={`email-input-${index}`} className="flex items-center gap-2 text-xs text-[#a1a1aa] mb-2">
                                    <Mail className="w-3 h-3" />
                                    Email
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id={`email-input-${index}`}
                                        type="text"
                                        value={cred.email}
                                        readOnly
                                        aria-label="Demo email address"
                                        className="flex-1 bg-[#1a1a1b] border border-[#2a2a2b] rounded-lg px-3 py-2 text-sm text-white font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(cred.email, `email-${index}`)}
                                        className="p-2 bg-[#1a1a1b] border border-[#2a2a2b] rounded-lg hover:bg-[#2a2a2b] transition-colors"
                                        title="Copy email"
                                    >
                                        {copiedField === `email-${index}` ? (
                                            <Check className="w-4 h-4 text-[#10b981]" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-[#a1a1aa]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor={`password-input-${index}`} className="flex items-center gap-2 text-xs text-[#a1a1aa] mb-2">
                                    <Lock className="w-3 h-3" />
                                    Password
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id={`password-input-${index}`}
                                        type="text"
                                        value={cred.password}
                                        readOnly
                                        aria-label="Demo password"
                                        className="flex-1 bg-[#1a1a1b] border border-[#2a2a2b] rounded-lg px-3 py-2 text-sm text-white font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(cred.password, `password-${index}`)}
                                        className="p-2 bg-[#1a1a1b] border border-[#2a2a2b] rounded-lg hover:bg-[#2a2a2b] transition-colors"
                                        title="Copy password"
                                    >
                                        {copiedField === `password-${index}` ? (
                                            <Check className="w-4 h-4 text-[#10b981]" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-[#a1a1aa]" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Accounts Info */}
                <div className="bg-[#0a0a0b] border border-[#2a2a2b] rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">More Demo Accounts</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="text-white font-semibold mb-2">Students</h4>
                            <ul className="space-y-1 text-[#a1a1aa]">
                                <li>• priya.sharma@iitdelhi.ac.in</li>
                                <li>• rahul.verma@du.ac.in</li>
                                <li>• sneha.reddy@aiims.edu</li>
                                <li>• amit.kumar@jnu.ac.in</li>
                                <li>• neha.gupta@nift.ac.in</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-2">Owners</h4>
                            <ul className="space-y-1 text-[#a1a1aa]">
                                <li>• rajesh.mehta@gmail.com</li>
                                <li>• sunita.kapoor@gmail.com</li>
                                <li>• vikas.sharma@gmail.com</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#2a2a2b]">
                        <p className="text-sm text-[#a1a1aa] flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#10b981]" />
                            All accounts use password: <code className="px-2 py-1 bg-[#1a1a1b] rounded text-white font-mono">Demo@123</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

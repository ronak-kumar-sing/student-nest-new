import { Shield, Award, Users, CheckCircle } from 'lucide-react';

export default function TrustBadges() {
    const badges = [
        {
            icon: Shield,
            title: "100% Verified",
            subtitle: "All Properties",
            color: "#7c3aed"
        },
        {
            icon: Award,
            title: "Trusted by",
            subtitle: "500+ Students",
            color: "#3b82f6"
        },
        {
            icon: Users,
            title: "25+ Colleges",
            subtitle: "Pan India",
            color: "#10b981"
        },
        {
            icon: CheckCircle,
            title: "Zero Hidden",
            subtitle: "Charges",
            color: "#f59e0b"
        }
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 py-6">
            {badges.map((badge, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1a1a1b] border border-[#2a2a2b] hover:border-[#3a3a3b] transition-all duration-300 hover:scale-105"
                >
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${badge.color}20`, border: `1px solid ${badge.color}40` }}
                    >
                        <badge.icon
                            className="w-5 h-5"
                            style={{ color: badge.color }}
                        />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-white leading-tight">
                            {badge.title}
                        </div>
                        <div className="text-xs text-[#a1a1aa] leading-tight">
                            {badge.subtitle}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

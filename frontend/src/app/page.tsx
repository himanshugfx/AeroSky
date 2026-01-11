import Link from 'next/link'
import {
    Plane,
    Shield,
    FileCheck,
    Users,
    MapPin,
    BarChart3,
    ArrowRight
} from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <header className="dgca-header text-white">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8" />
                        <span className="text-xl font-bold">AeroSky India</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="px-4 py-2 hover:bg-white/10 rounded-lg">
                            Login
                        </Link>
                        <Link href="/register" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium">
                            Register
                        </Link>
                    </div>
                </nav>

                <div className="container mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Drone Compliance Made Simple
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                        Complete regulatory compliance platform for Indian drone operations.
                        Type Certification, UIN Registration, NPNT, and Flight Logging.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/register" className="px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium text-lg flex items-center gap-2">
                            Get Started <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/docs" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-lg">
                            Documentation
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Complete Compliance Coverage
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<FileCheck className="w-8 h-8 text-blue-600" />}
                            title="Type Certification"
                            description="Form D-1 management for drone model certification with DGCA integration."
                        />
                        <FeatureCard
                            icon={<Plane className="w-8 h-8 text-blue-600" />}
                            title="UIN Registration"
                            description="Automated Form D-2 submission and unique identification number generation."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-blue-600" />}
                            title="NPNT Validation"
                            description="No Permission No Takeoff - real-time flight authorization checks."
                        />
                        <FeatureCard
                            icon={<MapPin className="w-8 h-8 text-blue-600" />}
                            title="Zone Mapping"
                            description="Interactive airspace map with Red/Yellow/Green zone visualization."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-blue-600" />}
                            title="Pilot Management"
                            description="Remote Pilot Certificate tracking and renewal reminders."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-8 h-8 text-blue-600" />}
                            title="Flight Analytics"
                            description="Tamper-proof flight logs with compliance violation detection."
                        />
                    </div>
                </div>
            </section>

            {/* Compliance Standards */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-4">
                        Built for Indian Regulations
                    </h2>
                    <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                        Fully compliant with Drone Rules 2021, Bharatiya Vayuyan Adhiniyam 2024,
                        and aligned with Draft Civil Drone Bill 2025.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {['Drone Rules 2021', 'BVA 2024', 'NPNT Protocol', 'Digital Sky Integration', 'Form D-1 to D-5'].map((item) => (
                            <span key={item} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6" />
                            <span className="text-white font-bold">AeroSky India</span>
                        </div>
                        <p className="text-sm">
                            © 2026 AeroSky India. DGCA Compliance Platform.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="card p-6 card-hover">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

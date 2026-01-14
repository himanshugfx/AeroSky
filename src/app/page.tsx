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
                        <Shield className="w-8 h-8 text-amber-500" />
                        <span className="text-xl font-bold tracking-tight">Aerosys Aviation</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium transition-colors">
                            Register
                        </Link>
                    </div>
                </nav>

                <div className="container mx-auto px-6 py-20 text-center">
                    <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
                        Transforming Industries Through <br /><span className="text-amber-500">Advanced Drone Solutions</span>
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed text-balance">
                        Aerosys Aviation India Private Limited is an IIT Kanpur-incubated company
                        specializing in DGCA Type Certified UAV manufacturing and cutting-edge
                        aerial intelligence for the future.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/register" className="px-8 py-4 bg-amber-500 hover:bg-amber-600 rounded-lg font-bold text-lg flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-amber-500/20">
                            Get Started <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/docs" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg font-bold text-lg transition-all">
                            Explore Products
                        </Link>
                    </div>
                </div>
            </header>

            {/* Featured Products */}
            <section className="py-20 bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Our Flagship UAVs</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Engineered for excellence and reliability in the most demanding environments.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-full h-48 bg-gray-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                                <Plane className="w-20 h-20 text-blue-900/10" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">VEDANSH</h3>
                            <p className="text-gray-600 mb-6">Our high-performance surveillance and mapping drone designed for centimeter-level accuracy and long endurance.</p>
                            <Link href="/products/vedansh" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                Learn More <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-full h-48 bg-gray-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                                <Plane className="w-20 h-20 text-blue-900/10" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">SHAURYA</h3>
                            <p className="text-gray-600 mb-6">Built for rugged tactical surveillance and security, providing real-time intelligence in complex terrains.</p>
                            <Link href="/products/shaurya" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                Learn More <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Comprehensive Drone Services</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Centimeter-level accuracy for mapping, surveying, and industrial inspection.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<FileCheck className="w-10 h-10 text-amber-500" />}
                            title="Aerial Surveying & Mapping"
                            description="Centimeter-level accuracy with LiDAR and photogrammetry for topographic and corridor mapping."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-10 h-10 text-amber-500" />}
                            title="Precision Agriculture"
                            description="Crop health analysis, multispectral imaging, and automated spraying to optimize farm yields."
                        />
                        <FeatureCard
                            icon={<Shield className="w-10 h-10 text-amber-500" />}
                            title="Security & Surveillance"
                            description="Real-time border security, forest monitoring, and tactical surveillance for defense and law enforcement."
                        />
                        <FeatureCard
                            icon={<MapPin className="w-10 h-10 text-amber-500" />}
                            title="Infrastructure Inspection"
                            description="High-resolution thermal and visual analysis for bridges, towers, pipelines, and renewable energy assets."
                        />
                        <FeatureCard
                            icon={<Users className="w-10 h-10 text-amber-500" />}
                            title="Construction Monitoring"
                            description="Progress tracking, volumetric measurements, and 3D site mapping for large-scale infrastructure projects."
                        />
                        <FeatureCard
                            icon={<Plane className="w-10 h-10 text-amber-500" />}
                            title="DGCA Compliance"
                            description="Built-in NPNT validation, UIN management, and digital logbooks for regulatory compliance."
                        />
                    </div>
                </div>
            </section>

            {/* Specialized Applications */}
            <section className="py-24 bg-blue-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Supporting India's <br />Aviation Future</h2>
                            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                                We are committed to the 'Make in India' initiative, pushing the boundaries
                                of drone intelligence, hardware optimization, and autonomous systems.
                                Our solutions are trusted by enterprises across India.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {['IIT Kanpur Incubated', 'DGCA Type Certified', 'NPNT Protocol', 'Digital Sky Ready'].map((item) => (
                                    <span key={item} className="px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                                <div className="text-3xl font-bold text-amber-500 mb-1">2020</div>
                                <div className="text-sm text-blue-200">Founded</div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                                <div className="text-3xl font-bold text-amber-500 mb-1">IIT-K</div>
                                <div className="text-sm text-blue-200">Incubated</div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                                <div className="text-3xl font-bold text-amber-500 mb-1">Centimeter</div>
                                <div className="text-sm text-blue-200">Accuracy</div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                                <div className="text-3xl font-bold text-amber-500 mb-1">100%</div>
                                <div className="text-sm text-blue-200">Compliant</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-950 text-gray-500 py-16 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-6 h-6 text-amber-500" />
                                <span className="text-white font-bold text-xl">Aerosys Aviation</span>
                            </div>
                            <p className="text-sm max-w-xs text-center md:text-left">
                                Noida, Uttar Pradesh, India.<br />
                                CIN: U73200UP2020PTC134883
                            </p>
                        </div>
                        <div className="flex gap-12">
                            <div className="flex flex-col gap-2">
                                <h4 className="text-white font-bold mb-2">Company</h4>
                                <Link href="/about" className="hover:text-amber-500 transition-colors">About Us</Link>
                                <Link href="/products" className="hover:text-amber-500 transition-colors">Products</Link>
                                <Link href="/contact" className="hover:text-amber-500 transition-colors">Contact</Link>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h4 className="text-white font-bold mb-2">Legal</h4>
                                <Link href="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="hover:text-amber-500 transition-colors">Terms of Service</Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-white/5 text-center text-sm">
                        <p>© 2026 Aerosys Aviation India Private Limited. All rights reserved.</p>
                        <p className="mt-2 text-gray-600">Designed and Developed with ❤️ for Aerial Intelligence.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="mb-6 bg-amber-50 w-16 h-16 rounded-xl flex items-center justify-center">{icon}</div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    )
}

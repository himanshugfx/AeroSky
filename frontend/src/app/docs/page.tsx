import Link from 'next/link'
import { Shield, ArrowLeft, Book, Code, Server, Database, Plane, Users, Map, FileText, AlertTriangle, CheckCircle } from 'lucide-react'

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="dgca-header text-white">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-amber-500" />
                        <span className="text-xl font-bold tracking-tight text-white">Aerosys Aviation</span>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/login" className="px-4 py-2 hover:bg-white/10 rounded-lg">Login</Link>
                        <Link href="/register" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium">Register</Link>
                    </div>
                </nav>
                <div className="container mx-auto px-6 py-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                    <p className="text-xl text-blue-100 max-w-2xl">
                        Complete guide to the Aerosys Aviation drone compliance platform
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <nav className="sticky top-8 space-y-1">
                            <NavItem href="#overview" icon={Book}>Overview</NavItem>
                            <NavItem href="#architecture" icon={Server}>Architecture</NavItem>
                            <NavItem href="#getting-started" icon={Code}>Getting Started</NavItem>
                            <NavItem href="#modules" icon={Database}>Modules</NavItem>
                            <NavItem href="#api-reference" icon={FileText}>API Reference</NavItem>
                            <NavItem href="#compliance" icon={CheckCircle}>Compliance</NavItem>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-12">
                        {/* Overview */}
                        <Section id="overview" title="Overview" icon={Book}>
                            <p className="text-gray-600 mb-6">
                                Aerosys Aviation is a comprehensive drone compliance platform designed for the Indian aviation
                                regulatory framework. It provides end-to-end management of drone operations from type certification
                                to flight logging, ensuring full compliance with DGCA regulations.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">
                                <FeatureCard title="Type Certification" description="Form D-1 management for drone model approval" />
                                <FeatureCard title="UIN Registration" description="Unique Identification Number generation (D-2)" />
                                <FeatureCard title="Pilot Management" description="Remote Pilot Certificate tracking (D-4)" />
                                <FeatureCard title="NPNT Compliance" description="No Permission No Takeoff validation" />
                                <FeatureCard title="Flight Logging" description="Tamper-proof flight data recording" />
                                <FeatureCard title="Maintenance Tracking" description="Digital aircraft maintenance logbook" />
                            </div>

                            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Regulatory Framework</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Drone Rules, 2021 (as amended 2022, 2023)</li>
                                    <li>• Bharatiya Vayuyan Adhiniyam, 2024 (Indian Aviation Act)</li>
                                    <li>• Draft Civil Drone (Promotion and Regulation) Bill, 2025</li>
                                    <li>• Digital Sky Platform Integration</li>
                                </ul>
                            </div>
                        </Section>

                        {/* Architecture */}
                        <Section id="architecture" title="System Architecture" icon={Server}>
                            <p className="text-gray-600 mb-6">
                                The platform uses a modern microservices architecture with clear separation between
                                frontend, backend, and database layers.
                            </p>

                            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                                <pre>{`┌─────────────────────────────────────────────────────────────┐
│                      AeroSky INDIA                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Next.js    │    │   FastAPI    │    │    Neon      │  │
│  │   Frontend   │◄──►│   Backend    │◄──►│  PostgreSQL  │  │
│  │   (React)    │    │   (Python)   │    │  (TimescaleDB)│  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         │                   │                    │          │
│         ▼                   ▼                    ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Tailwind    │    │ NPNT Engine  │    │   PostGIS    │  │
│  │  React Query │    │ Log Ingestor │    │  Extensions  │  │
│  │  Zustand     │    │ UIN Generator│    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
│                    ┌──────────────┐                         │
│                    │  Digital Sky │                         │
│                    │  API (DGCA)  │                         │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘`}</pre>
                            </div>

                            <div className="mt-6 grid md:grid-cols-3 gap-4">
                                <TechCard title="Frontend" tech="Next.js 14, React 18, TypeScript, Tailwind CSS, React Query" />
                                <TechCard title="Backend" tech="Python 3.11, FastAPI, SQLAlchemy, Pydantic, JWT Auth" />
                                <TechCard title="Database" tech="PostgreSQL 15, TimescaleDB, PostGIS, Neon Serverless" />
                            </div>
                        </Section>

                        {/* Getting Started */}
                        <Section id="getting-started" title="Getting Started" icon={Code}>
                            <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
                            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                                <li>Python 3.11 or higher</li>
                                <li>Node.js 18 or higher</li>
                                <li>PostgreSQL 15 (or Neon account)</li>
                                <li>Git</li>
                            </ul>

                            <h3 className="text-lg font-semibold mb-4">Backend Setup</h3>
                            <CodeBlock code={`# Clone and navigate to backend
cd "d:\\Aerosys aviation\\DGCA\\backend"

# Create virtual environment
python -m venv venv
venv\\Scripts\\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your database credentials

# Run development server
uvicorn app.main:app --reload --port 8000`} />

                            <h3 className="text-lg font-semibold mt-8 mb-4">Frontend Setup</h3>
                            <CodeBlock code={`# Navigate to frontend
cd "d:\\Aerosys aviation\\DGCA\\frontend"

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev`} />

                            <h3 className="text-lg font-semibold mt-8 mb-4">Database Setup</h3>
                            <CodeBlock code={`# Option 1: Neon (Recommended)
# Create account at neon.tech and get connection string

# Option 2: Local PostgreSQL
createdb aerosys_aviation
psql aerosys_aviation < database/schema.sql`} />
                        </Section>

                        {/* Modules */}
                        <Section id="modules" title="Platform Modules" icon={Database}>

                            <ModuleDoc
                                title="Registry Module"
                                icon={Plane}
                                description="Manages the complete drone registry including type certificates, UINs, and ownership."
                                features={[
                                    "Type Certificate (Form D-1) - Drone model certification with specs",
                                    "Drone Registration (Form D-2) - Individual UIN assignment",
                                    "Ownership Transfer (Form D-3) - Secure handshake protocol",
                                    "Pilot Certificates (Form D-4) - RPC management with 10-year validity",
                                    "RPTO Authorization (Form D-5) - Training organization management"
                                ]}
                            />

                            <ModuleDoc
                                title="Operations Module"
                                icon={Map}
                                description="Handles flight planning, NPNT validation, and real-time operations."
                                features={[
                                    "Flight Plan Creation - Polygon-based flight area definition",
                                    "Zone Validation - Red/Yellow/Green airspace checks",
                                    "NPNT Engine - 9-point compliance validation before takeoff",
                                    "Permission Artifacts - DGCA-signed flight authorization",
                                    "Flight Logging - Tamper-proof SHA-256 hash chain"
                                ]}
                            />

                            <ModuleDoc
                                title="Maintenance Module"
                                icon={FileText}
                                description="Digital maintenance logbook compliant with CA Form 19-10."
                                features={[
                                    "Component Tracking - Part installation and replacement history",
                                    "Scheduled Maintenance - Automatic due date calculations",
                                    "Technician Signatures - Digital sign-off requirements",
                                    "Dual Verification - Critical work requires second approval",
                                    "Audit Trail - Immutable maintenance records"
                                ]}
                            />

                            <ModuleDoc
                                title="Compliance Module"
                                icon={AlertTriangle}
                                description="Monitors violations and provides audit-ready reporting."
                                features={[
                                    "Violation Detection - Automatic flagging of non-compliance",
                                    "Severity Classification - Low/Medium/High/Critical ratings",
                                    "Section 10A Tracking - BVA 2024 penalty provisions",
                                    "Auditor View - Read-only access for DGCA inspectors",
                                    "Time-Travel Queries - Historical state reconstruction"
                                ]}
                            />
                        </Section>

                        {/* API Reference */}
                        <Section id="api-reference" title="API Reference" icon={FileText}>
                            <p className="text-gray-600 mb-6">
                                All API endpoints are available at <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8000/api/v1</code>.
                                Interactive documentation is available at <code className="bg-gray-100 px-2 py-1 rounded">/docs</code>.
                            </p>

                            <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                            <ApiEndpoint method="POST" path="/auth/register" description="Register new user" />
                            <ApiEndpoint method="POST" path="/auth/login" description="Login and get JWT token" />
                            <ApiEndpoint method="GET" path="/auth/me" description="Get current user profile" />
                            <ApiEndpoint method="POST" path="/auth/refresh" description="Refresh access token" />

                            <h3 className="text-lg font-semibold mt-8 mb-4">Drones</h3>
                            <ApiEndpoint method="GET" path="/drones" description="List drones (paginated, filterable)" />
                            <ApiEndpoint method="POST" path="/drones" description="Create new drone record" />
                            <ApiEndpoint method="GET" path="/drones/{id}" description="Get drone details" />
                            <ApiEndpoint method="PATCH" path="/drones/{id}" description="Update drone" />
                            <ApiEndpoint method="POST" path="/drones/generate-uin" description="Generate UIN for drone" />
                            <ApiEndpoint method="POST" path="/drones/generate-uin/batch" description="Batch UIN generation" />
                            <ApiEndpoint method="POST" path="/drones/{id}/activate" description="Activate registered drone" />

                            <h3 className="text-lg font-semibold mt-8 mb-4">Flight Operations</h3>
                            <ApiEndpoint method="GET" path="/flights/plans" description="List flight plans" />
                            <ApiEndpoint method="POST" path="/flights/plans" description="Create flight plan" />
                            <ApiEndpoint method="POST" path="/flights/validate-npnt" description="NPNT validation" />
                            <ApiEndpoint method="POST" path="/flights/validate-zone" description="Airspace zone check" />
                            <ApiEndpoint method="POST" path="/flights/logs/ingest" description="Ingest flight logs" />
                            <ApiEndpoint method="POST" path="/flights/plans/{id}/start" description="Mark flight started" />
                            <ApiEndpoint method="POST" path="/flights/plans/{id}/complete" description="Mark flight completed" />
                        </Section>

                        {/* Compliance */}
                        <Section id="compliance" title="Regulatory Compliance" icon={CheckCircle}>
                            <p className="text-gray-600 mb-6">
                                AeroSky India is designed to ensure full compliance with Indian drone regulations.
                                Here&apos;s how the platform addresses key regulatory requirements:
                            </p>

                            <div className="space-y-6">
                                <ComplianceItem
                                    regulation="Drone Rules 2021, Rule 15"
                                    requirement="UIN linked to FCM and RPS serial numbers"
                                    implementation="Database enforces unique FCM/RPS serials; modification triggers re-registration"
                                />
                                <ComplianceItem
                                    regulation="Drone Rules 2021, Rules 19-24"
                                    requirement="Red/Yellow/Green zone compliance"
                                    implementation="Real-time zone validation API; geofencing before flight approval"
                                />
                                <ComplianceItem
                                    regulation="BVA 2024, Section 45"
                                    requirement="Penalties up to ₹1 Crore for violations"
                                    implementation="Compliance violation tracking with severity and penalty sections"
                                />
                                <ComplianceItem
                                    regulation="Draft Bill 2025, Section 30"
                                    requirement="Mandatory maintenance records"
                                    implementation="Digital logbook with technician e-signatures; immutable audit log"
                                />
                                <ComplianceItem
                                    regulation="NPNT Protocol"
                                    requirement="No Permission No Takeoff"
                                    implementation="9-point validation; signed permission artifacts before motor arm"
                                />
                            </div>

                            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-900">Important Notice</h4>
                                        <p className="text-sm text-yellow-800 mt-1">
                                            This platform uses mock implementations for Digital Sky API integration.
                                            For production deployment, integrate with actual DGCA Digital Sky Platform APIs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </main>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
                <div className="container mx-auto px-6 text-center">
                    <p>© 2026 Aerosys Aviation India Private Limited. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

// Components
function NavItem({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
    return (
        <a href={href} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Icon className="w-4 h-4" />
            {children}
        </a>
    )
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            {children}
        </section>
    )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
    )
}

function TechCard({ title, tech }: { title: string; tech: string }) {
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
            <p className="text-sm text-gray-600">{tech}</p>
        </div>
    )
}

function CodeBlock({ code }: { code: string }) {
    return (
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{code}</pre>
        </div>
    )
}

function ModuleDoc({ title, icon: Icon, description, features }: { title: string; icon: any; description: string; features: string[] }) {
    return (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{description}</p>
            <ul className="space-y-2">
                {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{f}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function ApiEndpoint({ method, path, description }: { method: string; path: string; description: string }) {
    const methodColors: Record<string, string> = {
        GET: 'bg-green-100 text-green-700',
        POST: 'bg-blue-100 text-blue-700',
        PATCH: 'bg-yellow-100 text-yellow-700',
        DELETE: 'bg-red-100 text-red-700',
    }
    return (
        <div className="flex items-center gap-4 py-2 border-b border-gray-100">
            <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${methodColors[method]}`}>{method}</span>
            <code className="text-sm font-mono text-gray-800">{path}</code>
            <span className="text-sm text-gray-500">{description}</span>
        </div>
    )
}

function ComplianceItem({ regulation, requirement, implementation }: { regulation: string; requirement: string; implementation: string }) {
    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                    <p className="font-semibold text-gray-900">{regulation}</p>
                    <p className="text-sm text-gray-600 mt-1"><strong>Requirement:</strong> {requirement}</p>
                    <p className="text-sm text-gray-600"><strong>Implementation:</strong> {implementation}</p>
                </div>
            </div>
        </div>
    )
}

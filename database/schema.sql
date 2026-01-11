-- ============================================================================
-- SkyGuard India - Drone Compliance Platform
-- PostgreSQL Schema for Neon (with TimescaleDB & PostGIS extensions)
-- Version: 1.0.0
-- Compliant with: Drone Rules 2021, BVA 2024, Draft Civil Drone Bill 2025
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Drone Categories (Rule 5, Drone Rules 2021)
CREATE TYPE drone_category AS ENUM ('Aeroplane', 'Rotorcraft', 'Hybrid');
CREATE TYPE drone_sub_category AS ENUM ('RPAS', 'Model', 'Autonomous');
CREATE TYPE drone_class AS ENUM ('Nano', 'Micro', 'Small', 'Medium', 'Large');

-- Status Enums
CREATE TYPE certification_status AS ENUM ('Draft', 'Submitted', 'ATE_Review', 'Certified', 'Suspended', 'Revoked');
CREATE TYPE drone_status AS ENUM ('Draft', 'Registered', 'Active', 'Transfer_Pending', 'Deregistered', 'Lost', 'Damaged');
CREATE TYPE pilot_status AS ENUM ('Active', 'Suspended', 'Expired', 'Revoked');
CREATE TYPE flight_status AS ENUM ('Draft', 'Submitted', 'Approved', 'Rejected', 'InProgress', 'Completed', 'Aborted');
CREATE TYPE permission_status AS ENUM ('Valid', 'Used', 'Expired', 'Revoked');
CREATE TYPE maintenance_status AS ENUM ('Open', 'InProgress', 'Completed', 'Verified');
CREATE TYPE zone_type AS ENUM ('Green', 'Yellow', 'Red');

-- Identity Types (2023 Amendment - expanded from just Passport/Aadhaar)
CREATE TYPE id_type AS ENUM ('Passport', 'VoterID', 'RationCard', 'DrivingLicense', 'Aadhaar');

-- Operation Ratings
CREATE TYPE operation_rating AS ENUM ('VLOS', 'EVLOS', 'BVLOS');

-- User Roles (RBAC)
CREATE TYPE user_role AS ENUM ('Manufacturer', 'Pilot', 'Technician', 'Fleet_Manager', 'RPTO_Admin', 'DGCA_Auditor', 'System_Admin');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations (Manufacturers, Service Providers, RPTOs)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    gstin VARCHAR(15),
    registration_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    org_type VARCHAR(50), -- 'Manufacturer', 'Service_Provider', 'RPTO', 'Government'
    is_government_entity BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'Pilot',
    organization_id UUID REFERENCES organizations(id),
    aadhaar_number VARCHAR(12), -- Encrypted
    id_type id_type,
    id_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REGISTRY MODULE (Forms D-1 to D-5)
-- ============================================================================

-- Type Certificates (Form D-1)
-- Stores the "DNA" of each drone model
CREATE TABLE type_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Manufacturer Details
    manufacturer_id UUID REFERENCES organizations(id) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    model_number VARCHAR(100),
    
    -- Classification (Rule 5)
    category drone_category NOT NULL,
    sub_category drone_sub_category NOT NULL,
    weight_class drone_class NOT NULL,
    
    -- Physical Specifications
    max_takeoff_weight_kg DECIMAL(10,3) NOT NULL,
    empty_weight_kg DECIMAL(10,3),
    payload_capacity_kg DECIMAL(10,3),
    length_mm INTEGER,
    width_mm INTEGER,
    height_mm INTEGER,
    rotor_diameter_mm INTEGER,
    wing_span_mm INTEGER,
    num_rotors INTEGER,
    
    -- Performance Specifications
    max_endurance_min INTEGER,
    max_range_km DECIMAL(10,2),
    max_speed_mps DECIMAL(10,2),
    max_altitude_ft INTEGER,
    operating_altitude_min_ft INTEGER DEFAULT 0,
    operating_altitude_max_ft INTEGER,
    
    -- Propulsion
    engine_type VARCHAR(100), -- 'Electric', 'Hybrid', 'IC'
    motor_type VARCHAR(100),
    power_rating_kw DECIMAL(10,2),
    num_engines INTEGER DEFAULT 1,
    battery_capacity_mah INTEGER,
    battery_type VARCHAR(50),
    fuel_capacity_kg DECIMAL(10,3),
    
    -- Control Systems
    fcm_make VARCHAR(100), -- Flight Control Module
    fcm_model VARCHAR(100),
    rps_make VARCHAR(100), -- Remote Pilot Station
    rps_model VARCHAR(100),
    gcs_software_version VARCHAR(50), -- Ground Control Station
    frequency_band VARCHAR(50), -- e.g., '2.4GHz', '5.8GHz'
    
    -- Safety Features (Mandatory Checks)
    npnt_compliant BOOLEAN DEFAULT FALSE,
    geofencing_capable BOOLEAN DEFAULT FALSE,
    return_to_home BOOLEAN DEFAULT FALSE,
    obstacle_avoidance BOOLEAN DEFAULT FALSE,
    tracking_beacon BOOLEAN DEFAULT FALSE,
    
    -- Compatible Payloads (JSONB for flexibility)
    compatible_payloads JSONB DEFAULT '[]',
    -- Example: [{"name": "RGB Camera", "weight_kg": 0.5, "type": "imaging"}]
    
    -- Documentation Links
    operating_manual_url TEXT,
    maintenance_guidelines_url TEXT,
    maintenance_schedule_hours INTEGER, -- Replace props every X hours
    
    -- Images
    front_view_image_url TEXT,
    top_view_image_url TEXT,
    
    -- Certification
    certificate_number VARCHAR(50) UNIQUE,
    certification_status certification_status DEFAULT 'Draft',
    certified_date DATE,
    expiry_date DATE,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drones (Form D-2 - UIN Registration)
-- Individual drone instances
CREATE TABLE drones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification (Rule 15)
    uin VARCHAR(20) UNIQUE, -- Unique Identification Number (DGCA assigned)
    dan VARCHAR(20), -- Drone Acknowledgement Number (temporary)
    manufacturer_serial_number VARCHAR(100) NOT NULL,
    fcm_serial_number VARCHAR(100), -- Flight Control Module Serial (Rule 15 linkage)
    rps_serial_number VARCHAR(100), -- Remote Pilot Station Serial (Rule 15 linkage)
    
    -- Relationships
    type_certificate_id UUID REFERENCES type_certificates(id) NOT NULL,
    owner_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Status
    status drone_status DEFAULT 'Draft',
    registration_date DATE,
    
    -- Insurance (Section 10, Drone Rules 2021)
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_coverage_amount DECIMAL(15,2),
    insurance_start_date DATE,
    insurance_expiry_date DATE,
    
    -- Current Assignment
    assigned_pilot_id UUID REFERENCES users(id),
    home_base_location GEOMETRY(POINT, 4326),
    
    -- Manufacturing Details (for PLI tracking)
    manufacturing_date DATE,
    manufacturing_batch VARCHAR(50),
    local_content_percentage DECIMAL(5,2), -- Make in India compliance
    
    -- Firmware
    current_firmware_version VARCHAR(50),
    last_firmware_update TIMESTAMPTZ,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pilots (Form D-4 - Remote Pilot Certificate)
CREATE TABLE pilots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
    
    -- Certificate Details
    rpc_number VARCHAR(50) UNIQUE, -- Remote Pilot Certificate Number
    
    -- Personal Details
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    
    -- Identity (2023 Amendment - expanded options)
    primary_id_type id_type NOT NULL,
    primary_id_number VARCHAR(50) NOT NULL,
    secondary_id_type id_type,
    secondary_id_number VARCHAR(50),
    
    -- Training Details
    rpto_id UUID REFERENCES organizations(id),
    rpto_authorization_number VARCHAR(50),
    training_start_date DATE,
    training_completion_date DATE,
    
    -- Ratings
    category_rating drone_category,
    class_rating drone_class,
    operation_rating operation_rating DEFAULT 'VLOS',
    
    -- Validity
    issue_date DATE,
    expiry_date DATE, -- 10 years from issue (Rule 35)
    status pilot_status DEFAULT 'Active',
    
    -- Medical
    medical_certificate_number VARCHAR(50),
    medical_expiry_date DATE,
    
    -- Flight Experience
    total_flight_hours DECIMAL(10,2) DEFAULT 0,
    last_flight_date DATE,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPTOs (Form D-5 - Remote Pilot Training Organizations)
CREATE TABLE rptos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL UNIQUE,
    
    -- Authorization
    authorization_number VARCHAR(50) UNIQUE,
    authorization_date DATE,
    authorization_expiry DATE,
    
    -- Head of Organization
    head_name VARCHAR(255),
    head_designation VARCHAR(100),
    head_contact VARCHAR(20),
    head_email VARCHAR(255),
    
    -- Infrastructure
    airfield_address TEXT,
    airfield_size_sqm DECIMAL(15,2),
    num_classrooms INTEGER,
    simulator_available BOOLEAN DEFAULT FALSE,
    
    -- Capacity
    max_students_per_batch INTEGER,
    courses_offered JSONB DEFAULT '[]',
    -- Example: [{"name": "Basic RPAS", "duration_days": 5, "category": "Micro"}]
    
    -- Fleet
    training_drone_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_audit_date DATE,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPTO Instructors
CREATE TABLE rpto_instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rpto_id UUID REFERENCES rptos(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    instructor_certificate_number VARCHAR(50),
    specializations JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    joined_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rpto_id, user_id)
);

-- Transfers (Form D-3)
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drone_id UUID REFERENCES drones(id) NOT NULL,
    
    -- Transaction Type
    transaction_type VARCHAR(20) NOT NULL, -- 'Sale', 'Lease', 'Deregistration'
    
    -- Transferor (Current Owner)
    transferor_id UUID REFERENCES users(id) NOT NULL,
    transferor_org_id UUID REFERENCES organizations(id),
    
    -- Transferee (New Owner) - NULL for deregistration
    transferee_id UUID REFERENCES users(id),
    transferee_org_id UUID REFERENCES organizations(id),
    
    -- Deregistration Reason
    deregistration_reason VARCHAR(50), -- 'Permanently_Lost', 'Permanently_Damaged', 'Technical_Failure'
    deregistration_details TEXT,
    
    -- Handshake Protocol
    transferor_signature TEXT, -- Digital signature
    transferor_signed_at TIMESTAMPTZ,
    transferee_otp_verified BOOLEAN DEFAULT FALSE,
    transferee_accepted_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Accepted', 'Rejected', 'Completed'
    completed_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- OPERATIONS MODULE
-- ============================================================================

-- Flight Plans
CREATE TABLE flight_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core References
    drone_id UUID REFERENCES drones(id) NOT NULL,
    pilot_id UUID REFERENCES pilots(id) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    
    -- Flight Area (PostGIS)
    flight_polygon GEOMETRY(POLYGON, 4326) NOT NULL,
    takeoff_point GEOMETRY(POINT, 4326),
    landing_point GEOMETRY(POINT, 4326),
    
    -- Time Window
    planned_start TIMESTAMPTZ NOT NULL,
    planned_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    
    -- Altitude
    min_altitude_ft INTEGER DEFAULT 0,
    max_altitude_ft INTEGER NOT NULL,
    
    -- Zone Validation
    zone_status zone_type,
    zone_validated_at TIMESTAMPTZ,
    zone_validation_details JSONB,
    
    -- Purpose
    flight_purpose VARCHAR(255),
    payload_description TEXT,
    
    -- Pre-flight Checklist
    preflight_checklist_completed BOOLEAN DEFAULT FALSE,
    preflight_checklist_data JSONB,
    
    -- Status & Workflow
    status flight_status DEFAULT 'Draft',
    rejection_reason TEXT,
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permission Artifacts (NPNT - No Permission No Takeoff)
CREATE TABLE permission_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_plan_id UUID REFERENCES flight_plans(id) NOT NULL UNIQUE,
    
    -- Artifact Content
    artifact_xml TEXT NOT NULL,
    artifact_json JSONB,
    
    -- Digital Signature
    dgca_signature TEXT NOT NULL,
    signature_algorithm VARCHAR(50) DEFAULT 'RSA-SHA256',
    
    -- Validity
    issued_at TIMESTAMPTZ NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    
    -- Usage
    status permission_status DEFAULT 'Valid',
    used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flight Logs (TimescaleDB Hypertable for time-series data)
CREATE TABLE flight_logs (
    id UUID DEFAULT uuid_generate_v4(),
    drone_id UUID NOT NULL,
    flight_plan_id UUID,
    
    -- Timestamp (partition key)
    timestamp TIMESTAMPTZ NOT NULL,
    
    -- Position
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude_m DECIMAL(10, 2) NOT NULL,
    altitude_agl_m DECIMAL(10, 2), -- Above Ground Level
    
    -- Attitude
    heading_deg DECIMAL(5, 2),
    pitch_deg DECIMAL(5, 2),
    roll_deg DECIMAL(5, 2),
    
    -- Velocity
    ground_speed_mps DECIMAL(8, 2),
    vertical_speed_mps DECIMAL(8, 2),
    
    -- System Status
    battery_voltage DECIMAL(5, 2),
    battery_percentage INTEGER,
    motor_rpm INTEGER[],
    gps_satellites INTEGER,
    signal_strength INTEGER, -- RSSI
    
    -- Log Chaining (Tamper-proof)
    sequence_number BIGINT NOT NULL,
    previous_hash VARCHAR(64), -- SHA-256 of previous entry
    entry_hash VARCHAR(64) NOT NULL, -- SHA-256 of this entry
    
    -- Signature
    drone_signature TEXT, -- PKI signature from drone
    
    PRIMARY KEY (drone_id, timestamp)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('flight_logs', 'timestamp', 
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Flight Log Summary (aggregated per flight)
CREATE TABLE flight_log_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_plan_id UUID REFERENCES flight_plans(id) NOT NULL UNIQUE,
    drone_id UUID REFERENCES drones(id) NOT NULL,
    pilot_id UUID REFERENCES pilots(id) NOT NULL,
    
    -- Time
    takeoff_time TIMESTAMPTZ,
    landing_time TIMESTAMPTZ,
    total_flight_duration_sec INTEGER,
    
    -- Distance
    total_distance_km DECIMAL(10, 2),
    max_distance_from_home_km DECIMAL(10, 2),
    
    -- Altitude
    max_altitude_m DECIMAL(10, 2),
    avg_altitude_m DECIMAL(10, 2),
    
    -- Speed
    max_speed_mps DECIMAL(8, 2),
    avg_speed_mps DECIMAL(8, 2),
    
    -- Battery
    battery_start_percentage INTEGER,
    battery_end_percentage INTEGER,
    battery_consumed_mah INTEGER,
    
    -- Compliance
    geofence_breaches INTEGER DEFAULT 0,
    altitude_violations INTEGER DEFAULT 0,
    permission_artifact_valid BOOLEAN,
    
    -- Log Integrity
    total_log_entries BIGINT,
    first_entry_hash VARCHAR(64),
    last_entry_hash VARCHAR(64),
    chain_verified BOOLEAN,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MAINTENANCE MODULE (CA Form 19-10)
-- ============================================================================

-- Components (for tracking parts)
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    category VARCHAR(100), -- 'Motor', 'Propeller', 'Battery', 'FCM', 'Camera', etc.
    manufacturer VARCHAR(255),
    expected_lifespan_hours DECIMAL(10,2),
    is_critical BOOLEAN DEFAULT FALSE, -- Critical = affects airworthiness
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drone Components (installed parts)
CREATE TABLE drone_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drone_id UUID REFERENCES drones(id) NOT NULL,
    component_id UUID REFERENCES components(id) NOT NULL,
    serial_number VARCHAR(100),
    installation_date DATE NOT NULL,
    installation_hours DECIMAL(10,2) DEFAULT 0,
    current_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Replaced', 'Failed'
    replaced_date DATE,
    replaced_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Logs
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drone_id UUID REFERENCES drones(id) NOT NULL,
    
    -- Work Details
    work_order_number VARCHAR(50),
    maintenance_type VARCHAR(50), -- 'Scheduled', 'Unscheduled', 'Inspection', 'Repair'
    component_affected VARCHAR(100),
    defect_observed TEXT,
    action_taken TEXT NOT NULL,
    
    -- Parts Replaced
    parts_replaced JSONB DEFAULT '[]',
    -- Example: [{"component_id": "uuid", "old_serial": "X", "new_serial": "Y", "source": "OEM"}]
    
    -- Technician
    technician_id UUID REFERENCES users(id) NOT NULL,
    technician_license_number VARCHAR(50),
    technician_signature TEXT, -- Digital signature (mandatory per Draft Bill 2025)
    work_date TIMESTAMPTZ NOT NULL,
    
    -- Verification (dual sign-off for critical work)
    verifier_id UUID REFERENCES users(id),
    verifier_signature TEXT,
    verified_at TIMESTAMPTZ,
    
    -- Next Due
    next_due_date DATE,
    next_due_hours DECIMAL(10, 2),
    next_due_type VARCHAR(50), -- 'Inspection', 'Replacement', etc.
    
    -- Status
    status maintenance_status DEFAULT 'Open',
    
    -- Audit Fields
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Schedule Templates
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_certificate_id UUID REFERENCES type_certificates(id) NOT NULL,
    component_category VARCHAR(100) NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    interval_hours DECIMAL(10,2),
    interval_days INTEGER,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MANUFACTURING MODULE (PLI Compliance)
-- ============================================================================

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15),
    address TEXT,
    country VARCHAR(100),
    is_domestic BOOLEAN DEFAULT TRUE, -- For local content calculation
    component_categories JSONB DEFAULT '[]',
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill of Materials
CREATE TABLE bill_of_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_certificate_id UUID REFERENCES type_certificates(id) NOT NULL,
    component_id UUID REFERENCES components(id) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    quantity INTEGER DEFAULT 1,
    unit_cost DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    is_domestic BOOLEAN DEFAULT TRUE,
    sourcing_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(type_certificate_id, component_id)
);

-- Production Batches
CREATE TABLE production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_certificate_id UUID REFERENCES type_certificates(id) NOT NULL,
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    production_date DATE NOT NULL,
    quantity_planned INTEGER,
    quantity_produced INTEGER DEFAULT 0,
    quantity_passed_qc INTEGER DEFAULT 0,
    local_content_percentage DECIMAL(5, 2),
    status VARCHAR(20) DEFAULT 'InProgress', -- 'InProgress', 'Completed', 'QC_Passed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT & COMPLIANCE
-- ============================================================================

-- Compliance Violations (Section 10A tracking)
CREATE TABLE compliance_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Subject
    drone_id UUID REFERENCES drones(id),
    pilot_id UUID REFERENCES pilots(id),
    organization_id UUID REFERENCES organizations(id),
    flight_plan_id UUID REFERENCES flight_plans(id),
    
    -- Violation Details
    violation_type VARCHAR(100) NOT NULL,
    -- Examples: 'NPNT_Bypass', 'Zone_Breach', 'Altitude_Violation', 'Expired_RPC', 'Overdue_Maintenance'
    violation_code VARCHAR(20),
    severity VARCHAR(20), -- 'Low', 'Medium', 'High', 'Critical'
    description TEXT,
    
    -- Evidence
    evidence_data JSONB,
    flight_log_reference UUID,
    
    -- Resolution
    status VARCHAR(20) DEFAULT 'Open', -- 'Open', 'UnderReview', 'Resolved', 'Escalated'
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    
    -- Penalties (if applicable)
    penalty_amount DECIMAL(15, 2),
    penalty_section VARCHAR(50), -- e.g., 'Section 45 BVA 2024'
    
    -- Audit Fields
    detected_by VARCHAR(50), -- 'System', 'Manual', 'DGCA_Audit'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Audit Log (immutable)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    user_role user_role,
    ip_address INET,
    
    -- What
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    
    -- Details
    old_values JSONB,
    new_values JSONB,
    
    -- When
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Make audit_log append-only (no updates or deletes)
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Drones
CREATE INDEX idx_drones_uin ON drones(uin);
CREATE INDEX idx_drones_status ON drones(status);
CREATE INDEX idx_drones_owner ON drones(owner_id);
CREATE INDEX idx_drones_type_cert ON drones(type_certificate_id);

-- Pilots
CREATE INDEX idx_pilots_rpc ON pilots(rpc_number);
CREATE INDEX idx_pilots_status ON pilots(status);
CREATE INDEX idx_pilots_expiry ON pilots(expiry_date);

-- Flight Plans
CREATE INDEX idx_flight_plans_drone ON flight_plans(drone_id);
CREATE INDEX idx_flight_plans_pilot ON flight_plans(pilot_id);
CREATE INDEX idx_flight_plans_status ON flight_plans(status);
CREATE INDEX idx_flight_plans_time ON flight_plans(planned_start, planned_end);
CREATE INDEX idx_flight_plans_geo ON flight_plans USING GIST(flight_polygon);

-- Flight Logs (TimescaleDB auto-indexes on timestamp)
CREATE INDEX idx_flight_logs_drone ON flight_logs(drone_id);
CREATE INDEX idx_flight_logs_plan ON flight_logs(flight_plan_id);

-- Maintenance
CREATE INDEX idx_maintenance_drone ON maintenance_logs(drone_id);
CREATE INDEX idx_maintenance_status ON maintenance_logs(status);
CREATE INDEX idx_maintenance_next_due ON maintenance_logs(next_due_date);

-- Compliance Violations
CREATE INDEX idx_violations_status ON compliance_violations(status);
CREATE INDEX idx_violations_drone ON compliance_violations(drone_id);
CREATE INDEX idx_violations_type ON compliance_violations(violation_type);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Active Drones with Compliance Status
CREATE VIEW v_drone_compliance AS
SELECT 
    d.id,
    d.uin,
    d.manufacturer_serial_number,
    d.status,
    tc.model_name,
    tc.weight_class,
    u.full_name AS owner_name,
    d.insurance_expiry_date,
    CASE WHEN d.insurance_expiry_date < NOW() THEN 'Expired' ELSE 'Valid' END AS insurance_status,
    p.rpc_number AS assigned_pilot_rpc,
    p.expiry_date AS pilot_expiry,
    (SELECT MAX(next_due_date) FROM maintenance_logs ml WHERE ml.drone_id = d.id AND ml.status != 'Completed') AS next_maintenance_due,
    (SELECT COUNT(*) FROM compliance_violations cv WHERE cv.drone_id = d.id AND cv.status = 'Open') AS open_violations
FROM drones d
LEFT JOIN type_certificates tc ON d.type_certificate_id = tc.id
LEFT JOIN users u ON d.owner_id = u.id
LEFT JOIN pilots p ON d.assigned_pilot_id = p.user_id;

-- Pilots Due for Renewal (60 day warning as per Rule 35)
CREATE VIEW v_pilots_renewal_due AS
SELECT 
    p.id,
    p.rpc_number,
    p.full_name,
    p.expiry_date,
    p.expiry_date - INTERVAL '60 days' AS reminder_date,
    u.email,
    u.phone
FROM pilots p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'Active'
AND p.expiry_date <= NOW() + INTERVAL '60 days';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_type_certificates_updated_at BEFORE UPDATE ON type_certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_drones_updated_at BEFORE UPDATE ON drones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pilots_updated_at BEFORE UPDATE ON pilots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rptos_updated_at BEFORE UPDATE ON rptos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_flight_plans_updated_at BEFORE UPDATE ON flight_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_maintenance_logs_updated_at BEFORE UPDATE ON maintenance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit trigger for critical tables
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (
        current_setting('app.current_user_id', true)::UUID,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to critical tables
CREATE TRIGGER audit_drones AFTER INSERT OR UPDATE OR DELETE ON drones FOR EACH ROW EXECUTE FUNCTION audit_changes();
CREATE TRIGGER audit_pilots AFTER INSERT OR UPDATE OR DELETE ON pilots FOR EACH ROW EXECUTE FUNCTION audit_changes();
CREATE TRIGGER audit_flight_plans AFTER INSERT OR UPDATE OR DELETE ON flight_plans FOR EACH ROW EXECUTE FUNCTION audit_changes();
CREATE TRIGGER audit_maintenance AFTER INSERT OR UPDATE OR DELETE ON maintenance_logs FOR EACH ROW EXECUTE FUNCTION audit_changes();
CREATE TRIGGER audit_transfers AFTER INSERT OR UPDATE OR DELETE ON transfers FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Default components
INSERT INTO components (id, name, part_number, category, is_critical) VALUES
(uuid_generate_v4(), 'Propeller Set (4x)', 'PROP-001', 'Propeller', FALSE),
(uuid_generate_v4(), 'LiPo Battery 4S 5000mAh', 'BAT-001', 'Battery', TRUE),
(uuid_generate_v4(), 'Flight Controller', 'FCM-001', 'FCM', TRUE),
(uuid_generate_v4(), 'Brushless Motor', 'MOT-001', 'Motor', TRUE),
(uuid_generate_v4(), 'ESC (Electronic Speed Controller)', 'ESC-001', 'ESC', TRUE),
(uuid_generate_v4(), 'GPS Module', 'GPS-001', 'Navigation', TRUE),
(uuid_generate_v4(), 'Remote Controller', 'RPS-001', 'RPS', TRUE),
(uuid_generate_v4(), 'Camera Gimbal', 'GIM-001', 'Payload', FALSE);

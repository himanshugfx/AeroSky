"use client";

import { useState, useEffect } from "react";
import {
    ClipboardList,
    Plus,
    Download,
    Trash2,
    Edit2,
    ChevronDown,
    ChevronUp,
    Search,
    FileSpreadsheet,
    X,
} from "lucide-react";
import { useComplianceStore, Order } from "@/lib/complianceStore";

// Dropdown options
const CLIENT_SEGMENTS = ["Defense", "Agriculture", "Logistics", "Infrastructure", "Other"];
const DRONE_TYPES = ["Fixed-wing", "Multirotor", "Hybrid VTOL"];
const WEIGHT_CLASSES = ["Nano", "Micro", "Small", "Medium"];
const PAYLOAD_CONFIGS = ["LiDAR", "Thermal IR", "RGB Camera", "Sprayer", "Multi-Sensor", "None"];
const SOFTWARE_TIERS = ["Basic", "Autonomy Level 4", "Swarm Capability", "Data Analytics", "Enterprise"];
const REVENUE_STATUSES = ["Pending", "Partially Billed", "Fully Billed", "Earned"];
const CERTIFICATION_STATUSES = ["Pending", "In Progress", "Approved", "N/A"];
const EXPORT_LICENSE_STATUSES = ["Not Required", "Pending", "Approved", "Rejected"];
const BOM_READINESS_OPTIONS = ["Not Ready", "Partial", "Ready"];
const MANUFACTURING_STAGES = ["In Design", "Assembly", "Quality Testing", "Flight Calibration", "Ready"];

const initialFormData = {
    contractNumber: "",
    clientName: "",
    clientSegment: "",
    orderDate: "",
    estimatedCompletionDate: "",
    contractValue: "",
    currency: "INR",
    revenueRecognitionStatus: "Pending",
    droneModel: "",
    droneType: "",
    weightClass: "",
    payloadConfiguration: "",
    flightEnduranceRequirements: "",
    softwareAiTier: "",
    dgcaFaaCertificationStatus: "Pending",
    uin: "",
    exportLicenseStatus: "",
    geofencingRequirements: "",
    bomReadiness: "Not Ready",
    manufacturingStage: "In Design",
    calibrationTestLogs: "",
    afterSalesAmc: "",
};

export default function OrdersPage() {
    const { orders, fetchOrders, addOrder, updateOrder, deleteOrder } = useComplianceStore();
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders().finally(() => setLoading(false));
    }, [fetchOrders]);

    const clearForm = () => {
        setFormData(initialFormData);
        setError("");
    };

    const handleOpenForm = (order?: Order) => {
        clearForm();
        if (order) {
            setEditingOrder(order);
            setFormData({
                contractNumber: order.contractNumber,
                clientName: order.clientName,
                clientSegment: order.clientSegment,
                orderDate: order.orderDate ? order.orderDate.split("T")[0] : "",
                estimatedCompletionDate: order.estimatedCompletionDate ? order.estimatedCompletionDate.split("T")[0] : "",
                contractValue: order.contractValue.toString(),
                currency: order.currency,
                revenueRecognitionStatus: order.revenueRecognitionStatus,
                droneModel: order.droneModel,
                droneType: order.droneType,
                weightClass: order.weightClass,
                payloadConfiguration: order.payloadConfiguration || "",
                flightEnduranceRequirements: order.flightEnduranceRequirements || "",
                softwareAiTier: order.softwareAiTier || "",
                dgcaFaaCertificationStatus: order.dgcaFaaCertificationStatus,
                uin: order.uin || "",
                exportLicenseStatus: order.exportLicenseStatus || "",
                geofencingRequirements: order.geofencingRequirements || "",
                bomReadiness: order.bomReadiness,
                manufacturingStage: order.manufacturingStage,
                calibrationTestLogs: order.calibrationTestLogs || "",
                afterSalesAmc: order.afterSalesAmc || "",
            });
        } else {
            setEditingOrder(null);
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingOrder(null);
        clearForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.contractNumber || !formData.clientName || !formData.clientSegment ||
            !formData.orderDate || !formData.contractValue || !formData.droneModel ||
            !formData.droneType || !formData.weightClass) {
            setError("Please fill in all required fields");
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                ...formData,
                contractValue: parseFloat(formData.contractValue) || 0,
            };
            if (editingOrder) {
                await updateOrder(editingOrder.id, orderData);
            } else {
                await addOrder(orderData as any);
            }
            handleCloseForm();
        } catch (err: any) {
            setError(err.message || "Failed to save order");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this order?")) {
            await deleteOrder(id);
        }
    };

    const handleDownload = async (ids: string | "all") => {
        try {
            const format = ids === "all" ? "xlsx" : "pdf";
            const url = ids === "all"
                ? "/api/orders/download?ids=all"
                : `/api/orders/download?ids=${ids}&format=pdf`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = ids === "all"
                ? `OrderBook_${new Date().toISOString().split("T")[0]}.xlsx`
                : `Order_${ids}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download orders");
        }
    };

    const filteredOrders = orders.filter(order =>
        order.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.droneModel.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency === "USD" ? "USD" : "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Ready":
            case "Approved":
            case "Earned":
            case "Fully Billed":
                return "bg-green-500/20 text-green-400";
            case "In Progress":
            case "Partial":
            case "Partially Billed":
            case "Assembly":
            case "Quality Testing":
            case "Flight Calibration":
                return "bg-yellow-500/20 text-yellow-400";
            case "Pending":
            case "Not Ready":
            case "In Design":
                return "bg-blue-500/20 text-blue-400";
            case "Rejected":
            case "N/A":
                return "bg-red-500/20 text-red-400";
            default:
                return "bg-gray-500/20 text-gray-400";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Order Book</h1>
                    <p className="text-sm text-gray-500">
                        {orders.length} order{orders.length !== 1 ? "s" : ""} in the system
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {orders.length > 0 && (
                        <button
                            onClick={() => handleDownload("all")}
                            className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 font-medium px-4 py-2.5 rounded-xl transition-colors border border-green-500/20"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Export All
                        </button>
                    )}
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        Add Order
                    </button>
                </div>
            </div>

            {/* Search */}
            {orders.length > 0 && (
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by contract number, client name, or drone model..."
                        className="w-full bg-[#0f0f12] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                    />
                </div>
            )}

            {/* Order List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-3">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-[#0f0f12] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                        >
                            {/* Order Header */}
                            <div
                                className="flex items-center gap-4 p-4 cursor-pointer"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <ClipboardList className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-semibold text-white truncate">{order.contractNumber}</p>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getStatusColor(order.manufacturingStage)}`}>
                                            {order.manufacturingStage}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{order.clientName}</span>
                                        <span>•</span>
                                        <span>{order.droneModel}</span>
                                        <span>•</span>
                                        <span className="font-semibold text-green-400">
                                            {formatCurrency(order.contractValue, order.currency)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(order.id);
                                        }}
                                        className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                        title="Download order"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenForm(order);
                                        }}
                                        className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        title="Edit order"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(order.id);
                                        }}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete order"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    {expandedOrder === order.id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedOrder === order.id && (
                                <div className="border-t border-white/5 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Core Order Info */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Financial Info</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500">Segment:</span> <span className="text-white">{order.clientSegment}</span></p>
                                            <p><span className="text-gray-500">Order Date:</span> <span className="text-white">{new Date(order.orderDate).toLocaleDateString()}</span></p>
                                            {order.estimatedCompletionDate && (
                                                <p><span className="text-gray-500">Est. Completion:</span> <span className="text-white">{new Date(order.estimatedCompletionDate).toLocaleDateString()}</span></p>
                                            )}
                                            <p><span className="text-gray-500">Revenue Status:</span> <span className={`px-1.5 py-0.5 text-xs rounded ${getStatusColor(order.revenueRecognitionStatus)}`}>{order.revenueRecognitionStatus}</span></p>
                                        </div>
                                    </div>

                                    {/* Technical Details */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Technical Config</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500">Type:</span> <span className="text-white">{order.droneType}</span></p>
                                            <p><span className="text-gray-500">Weight Class:</span> <span className="text-white">{order.weightClass}</span></p>
                                            {order.payloadConfiguration && <p><span className="text-gray-500">Payload:</span> <span className="text-white">{order.payloadConfiguration}</span></p>}
                                            {order.flightEnduranceRequirements && <p><span className="text-gray-500">Endurance:</span> <span className="text-white">{order.flightEnduranceRequirements}</span></p>}
                                            {order.softwareAiTier && <p><span className="text-gray-500">Software:</span> <span className="text-white">{order.softwareAiTier}</span></p>}
                                        </div>
                                    </div>

                                    {/* Regulatory */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Regulatory</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500">DGCA/FAA:</span> <span className={`px-1.5 py-0.5 text-xs rounded ${getStatusColor(order.dgcaFaaCertificationStatus)}`}>{order.dgcaFaaCertificationStatus}</span></p>
                                            {order.uin && <p><span className="text-gray-500">UIN:</span> <span className="text-white font-mono">{order.uin}</span></p>}
                                            {order.exportLicenseStatus && <p><span className="text-gray-500">Export License:</span> <span className={`px-1.5 py-0.5 text-xs rounded ${getStatusColor(order.exportLicenseStatus)}`}>{order.exportLicenseStatus}</span></p>}
                                            {order.geofencingRequirements && <p><span className="text-gray-500">Geofencing:</span> <span className="text-white">{order.geofencingRequirements}</span></p>}
                                        </div>
                                    </div>

                                    {/* Operational */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operational</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500">BOM:</span> <span className={`px-1.5 py-0.5 text-xs rounded ${getStatusColor(order.bomReadiness)}`}>{order.bomReadiness}</span></p>
                                            <p><span className="text-gray-500">Stage:</span> <span className={`px-1.5 py-0.5 text-xs rounded ${getStatusColor(order.manufacturingStage)}`}>{order.manufacturingStage}</span></p>
                                            {order.afterSalesAmc && <p><span className="text-gray-500">AMC:</span> <span className="text-white">{order.afterSalesAmc}</span></p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                        <ClipboardList className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-2">
                        {searchQuery ? "No Orders Found" : "No Orders Yet"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        {searchQuery
                            ? "Try adjusting your search query"
                            : "Start by adding your first order to the order book"}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => handleOpenForm()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add First Order
                        </button>
                    )}
                </div>
            )}

            {/* Add/Edit Order Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white">
                                {editingOrder ? "Edit Order" : "Add New Order"}
                            </h2>
                            <button
                                onClick={handleCloseForm}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Section 1: Core Order & Financial */}
                                <div>
                                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">
                                        Core Order & Financial Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Contract Number <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.contractNumber}
                                                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                                                placeholder="e.g., ORD-2026-001"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Client Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.clientName}
                                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                                placeholder="Client organization name"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Client Segment <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={formData.clientSegment}
                                                onChange={(e) => setFormData({ ...formData, clientSegment: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                <option value="">Select segment</option>
                                                {CLIENT_SEGMENTS.map((seg) => (
                                                    <option key={seg} value={seg}>{seg}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Order Date <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.orderDate}
                                                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Est. Completion Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.estimatedCompletionDate}
                                                onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Contract Value <span className="text-red-400">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={formData.currency}
                                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                    className="bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                                >
                                                    <option value="INR">₹</option>
                                                    <option value="USD">$</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={formData.contractValue}
                                                    onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                                                    placeholder="Amount"
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Revenue Status
                                            </label>
                                            <select
                                                value={formData.revenueRecognitionStatus}
                                                onChange={(e) => setFormData({ ...formData, revenueRecognitionStatus: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                {REVENUE_STATUSES.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Technical & Configuration */}
                                <div>
                                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">
                                        Technical & Configuration Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Drone Model <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.droneModel}
                                                onChange={(e) => setFormData({ ...formData, droneModel: e.target.value })}
                                                placeholder="e.g., AeroSky X1"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Drone Type <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={formData.droneType}
                                                onChange={(e) => setFormData({ ...formData, droneType: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                <option value="">Select type</option>
                                                {DRONE_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Weight Class <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={formData.weightClass}
                                                onChange={(e) => setFormData({ ...formData, weightClass: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                <option value="">Select class</option>
                                                {WEIGHT_CLASSES.map((wc) => (
                                                    <option key={wc} value={wc}>{wc}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Payload Configuration
                                            </label>
                                            <select
                                                value={formData.payloadConfiguration}
                                                onChange={(e) => setFormData({ ...formData, payloadConfiguration: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                <option value="">Select payload</option>
                                                {PAYLOAD_CONFIGS.map((pc) => (
                                                    <option key={pc} value={pc}>{pc}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Flight Endurance
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.flightEnduranceRequirements}
                                                onChange={(e) => setFormData({ ...formData, flightEnduranceRequirements: e.target.value })}
                                                placeholder="e.g., 45 minutes"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Software/AI Tier
                                            </label>
                                            <select
                                                value={formData.softwareAiTier}
                                                onChange={(e) => setFormData({ ...formData, softwareAiTier: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                <option value="">Select tier</option>
                                                {SOFTWARE_TIERS.map((tier) => (
                                                    <option key={tier} value={tier}>{tier}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Regulatory & Compliance */}
                                <div>
                                    <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-4">
                                        Regulatory & Compliance Tracking
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                DGCA/FAA Certification
                                            </label>
                                            <select
                                                value={formData.dgcaFaaCertificationStatus}
                                                onChange={(e) => setFormData({ ...formData, dgcaFaaCertificationStatus: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                {CERTIFICATION_STATUSES.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                UIN (Unique ID Number)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.uin}
                                                onChange={(e) => setFormData({ ...formData, uin: e.target.value })}
                                                placeholder="Government-issued ID"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Export License Status
                                            </label>
                                            <select
                                                value={formData.exportLicenseStatus}
                                                onChange={(e) => setFormData({ ...formData, exportLicenseStatus: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                <option value="">Select status</option>
                                                {EXPORT_LICENSE_STATUSES.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Geofencing Requirements
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.geofencingRequirements}
                                                onChange={(e) => setFormData({ ...formData, geofencingRequirements: e.target.value })}
                                                placeholder="Specific software restrictions based on operational region"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Operational & Delivery */}
                                <div>
                                    <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4">
                                        Operational & Delivery Status
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                BOM Readiness
                                            </label>
                                            <select
                                                value={formData.bomReadiness}
                                                onChange={(e) => setFormData({ ...formData, bomReadiness: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                {BOM_READINESS_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Manufacturing Stage
                                            </label>
                                            <select
                                                value={formData.manufacturingStage}
                                                onChange={(e) => setFormData({ ...formData, manufacturingStage: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            >
                                                {MANUFACTURING_STAGES.map((stage) => (
                                                    <option key={stage} value={stage}>{stage}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                After-Sales/AMC
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.afterSalesAmc}
                                                onChange={(e) => setFormData({ ...formData, afterSalesAmc: e.target.value })}
                                                placeholder="e.g., 1-year AMC included"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Calibration & Test Logs
                                            </label>
                                            <textarea
                                                value={formData.calibrationTestLogs}
                                                onChange={(e) => setFormData({ ...formData, calibrationTestLogs: e.target.value })}
                                                placeholder="Links or notes about flight test data required before handover"
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-white/5">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
                                    >
                                        {submitting ? "Saving..." : (editingOrder ? "Update Order" : "Add Order")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

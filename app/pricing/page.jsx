// app/pricing/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for trying out the service",
    features: [
      "Maximum 3 Resume Analyses",
      "Basic ATS Report",
      "Basic Scoring",
      "Email Support",
    ],
    icon: Sparkles,
    color: "from-gray-600 to-gray-400",
    buttonColor: "bg-gray-600 hover:bg-gray-700",
    borderColor: "border-white/10",
    popular: false,
    limits: {
      analyses: 3,
      reports: "Basic",
      support: "Email",
    },
  },
  {
    id: "basic",
    name: "Basic",
    price: "₹299",
    period: "/month",
    description: "For regular job seekers",
    features: [
      "Unlimited Resume Analyses",
      "Complete ATS Report",
      "Resume History",
      "Detailed Scoring",
      "Email Support",
      "Role Matching",
    ],
    icon: Zap,
    color: "from-blue-600 to-blue-400",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    borderColor: "border-[#7c5cff]",
    popular: true,
    limits: {
      analyses: "Unlimited",
      reports: "Complete",
      support: "Priority Email",
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹599",
    period: "/month",
    description: "For serious professionals",
    features: [
      "Unlimited Resume Analyses",
      "Priority Processing",
      "Premium Features",
      "Advanced ATS Report",
      "Priority Support",
      "Export Reports",
      "Interview Preparation",
      "Salary Insights",
    ],
    icon: Crown,
    color: "from-purple-600 to-purple-400",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    borderColor: "border-purple-500/50",
    popular: false,
    limits: {
      analyses: "Unlimited",
      reports: "Premium",
      support: "24/7 Priority",
    },
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=pricing");
    }
  }, [user, loading, router]);

  // Set current plan as selected
  useEffect(() => {
    if (user?.plan) {
      setSelectedPlan(user.plan.toLowerCase());
    }
  }, [user]);

  const handleSelectPlan = async (planId) => {
    if (!user) {
      router.push("/login?redirect=pricing");
      return;
    }

    // If user already has this plan, do nothing
    if (user.plan?.toLowerCase() === planId) {
      setError("You are already on this plan.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/pricing/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to select plan");
      }

      setSuccess(`Successfully upgraded to ${data.user.plan}!`);
      
      // Update user data
      if (data.user) {
        // Refresh the page to update auth context
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }

    } catch (err) {
      console.error("Plan selection error:", err);
      setError(err.message || "Failed to select plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanFeatures = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.features : [];
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#07050d] flex items-center justify-center">
          <div className="text-white text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#7c5cff] mx-auto" />
            <p className="mt-4 text-gray-400">Loading plans...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#07050d] py-20">
        {/* Background Effect */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#7c5cff]/15 blur-[120px]" />
          <div className="absolute right-1/4 bottom-[-10%] h-[400px] w-[400px] rounded-full bg-[#3b82f6]/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-medium uppercase tracking-wide text-[#7c5cff]">
                Pricing Plans
              </p>
              <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
                Choose Your Perfect Plan
              </h1>
              <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
                Upgrade to unlock unlimited resume analyses and premium features
              </p>
            </motion.div>

            {/* Current Plan Badge */}
            {user?.plan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-4 py-2"
              >
                <span className="text-sm text-gray-400">Current Plan:</span>
                <span className="text-sm font-semibold text-[#7c5cff]">{user.plan}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400">
                  {user.plan === "Free" 
                    ? `${user.resumeAnalysisCount || 0}/3 analyses used`
                    : "Unlimited analyses"}
                </span>
              </motion.div>
            )}

            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-md mx-auto bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-md mx-auto bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm"
              >
                {success}
              </motion.div>
            )}

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm ${billingCycle === "monthly" ? "text-white" : "text-gray-400"}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="relative h-8 w-16 rounded-full bg-[#0d0a17] border border-white/10 transition-colors"
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] transition-all ${
                    billingCycle === "yearly" ? "left-9" : "left-1"
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === "yearly" ? "text-white" : "text-gray-400"}`}>
                Yearly
                <span className="ml-1.5 text-xs text-[#7c5cff]">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => {
              const isCurrentPlan = user?.plan?.toLowerCase() === plan.id;
              const isFree = plan.id === "free";
              const price = billingCycle === "yearly" 
                ? `₹${Math.round(parseInt(plan.price.replace("₹", "")) * 0.8 * 12)}` 
                : plan.price;
              const period = billingCycle === "yearly" ? "/year" : plan.period;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-2xl border ${plan.borderColor} bg-[#0d0a17] p-8 transition-all hover:scale-[1.02] hover:shadow-xl ${
                    plan.popular ? "shadow-[0_0_40px_rgba(124,92,255,0.15)]" : ""
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-4 py-1 text-xs font-medium text-white shadow-lg">
                      Most Popular
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                      Active Plan
                    </div>
                  )}

                  {/* Plan Icon */}
                  <div className={`rounded-lg bg-gradient-to-r ${plan.color} p-3 inline-block`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h2 className="mt-4 text-xl font-semibold text-white">{plan.name}</h2>
                  <p className="mt-1 text-sm text-gray-400">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{price}</span>
                    <span className="text-gray-400 text-sm ml-1">{period}</span>
                  </div>

                  {/* Features List */}
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-[#7c5cff] shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Plan Limits */}
                  <div className="mt-6 rounded-lg bg-white/5 p-3">
                    <p className="text-xs text-gray-400">Plan Limits</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-300">
                        Analyses: <span className="text-white">{plan.limits.analyses}</span>
                      </p>
                      <p className="text-xs text-gray-300">
                        Reports: <span className="text-white">{plan.limits.reports}</span>
                      </p>
                      <p className="text-xs text-gray-300">
                        Support: <span className="text-white">{plan.limits.support}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isProcessing || isCurrentPlan}
                    className={`mt-8 w-full rounded-full px-4 py-3 text-sm font-medium text-white transition-all ${
                      isCurrentPlan
                        ? "bg-green-600 hover:bg-green-700 cursor-default"
                        : isFree
                        ? "bg-gray-600 hover:bg-gray-700"
                        : plan.buttonColor
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : isCurrentPlan ? (
                      "✓ Current Plan"
                    ) : isFree ? (
                      "Free Plan"
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>

                  {/* Savings Tag for Yearly */}
                  {billingCycle === "yearly" && !isFree && (
                    <p className="mt-2 text-center text-xs text-green-400">
                      Save 20% with yearly billing
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-2xl font-semibold text-white text-center">Frequently Asked Questions</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
              <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-6">
                <h3 className="text-sm font-medium text-white">What happens when I upgrade?</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Your plan is updated immediately. You get access to all features included in your new plan.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-6">
                <h3 className="text-sm font-medium text-white">Can I downgrade later?</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Yes, you can switch plans at any time. Your new plan will be effective immediately.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-6">
                <h3 className="text-sm font-medium text-white">What payment methods do you accept?</h3>
                <p className="mt-2 text-sm text-gray-400">
                  We accept all major credit cards, UPI, and net banking.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0d0a17] p-6">
                <h3 className="text-sm font-medium text-white">Is there a free trial?</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Yes! The Free plan gives you 3 analyses to try out our service.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-20 overflow-x-auto">
            <h2 className="text-2xl font-semibold text-white text-center mb-8">Compare Plans</h2>
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="p-4 text-center text-sm font-medium text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-sm text-gray-300">Analyses</td>
                  <td className="p-4 text-center text-sm text-gray-400">3</td>
                  <td className="p-4 text-center text-sm text-[#7c5cff]">Unlimited</td>
                  <td className="p-4 text-center text-sm text-[#7c5cff]">Unlimited</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-sm text-gray-300">ATS Report</td>
                  <td className="p-4 text-center text-sm text-gray-400">Basic</td>
                  <td className="p-4 text-center text-sm text-[#7c5cff]">Complete</td>
                  <td className="p-4 text-center text-sm text-[#7c5cff]">Premium</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-sm text-gray-300">Resume History</td>
                  <td className="p-4 text-center text-sm text-gray-400">
                    <X className="h-4 w-4 mx-auto text-gray-600" />
                  </td>
                  <td className="p-4 text-center text-sm text-[#7c5cff]">
                    <Check className="h-4 w-4 mx-auto" />
                  </td>
                  <td className="p-4 text-center text-sm text-[#7c5cff]">
                    <Check className="h-4 w-4 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-4 text-sm text-gray-300">Priority Support</td>
                  <td className="p-4 text-center text-sm text-gray-400">
                    <X className="h-4 w-4 mx-auto text-gray-600" />
                  </td>
                  <td className="p-4 text-center text-sm text-gray-400">
                    <X className="h-4 w-4 mx-auto text-gray-600" />
                  </td>
                  <td className="p-4 text-center text-sm text-[#7c5cff]">
                    <Check className="h-4 w-4 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-sm text-gray-300">Export Reports</td>
                  <td className="p-4 text-center text-sm text-gray-400">
                    <X className="h-4 w-4 mx-auto text-gray-600" />
                  </td>
                  <td className="p-4 text-center text-sm text-gray-400">
                    <X className="h-4 w-4 mx-auto text-gray-600" />
                  </td>
                  <td className="p-4 text-center text-sm text-[#7c5cff]">
                    <Check className="h-4 w-4 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Trust Section */}
          <div className="mt-20 text-center">
            <p className="text-sm text-gray-400">
              All plans include access to your resume history and basic features.
              <br />
              Need help? Contact our support team at{" "}
              <a href="mailto:support@resumepro.com" className="text-[#7c5cff] hover:underline">
                support@resumepro.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
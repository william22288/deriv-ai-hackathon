import * as api from './hr-api';

// Seed initial compliance data
export async function seedComplianceData() {
  const sampleData = [
    {
      type: "permit",
      title: "H-1B Work Authorization",
      employee: "Miguel Rodriguez",
      jurisdiction: "US",
      status: "expiring",
      dueDate: "March 10, 2026",
      daysUntilDue: 31,
      priority: "high"
    },
    {
      type: "training",
      title: "Anti-Harassment Training",
      employee: "Sarah Johnson",
      jurisdiction: "US-CA",
      status: "overdue",
      dueDate: "February 1, 2026",
      daysUntilDue: -6,
      priority: "critical"
    },
    {
      type: "permit",
      title: "UK Work Permit Renewal",
      employee: "James Mitchell",
      jurisdiction: "UK",
      status: "expiring",
      dueDate: "April 15, 2026",
      daysUntilDue: 67,
      priority: "medium"
    },
    {
      type: "certification",
      title: "ISO 27001 Certification",
      jurisdiction: "DE",
      status: "compliant",
      dueDate: "September 30, 2026",
      daysUntilDue: 235,
      priority: "low"
    },
    {
      type: "training",
      title: "GDPR Compliance Training",
      employee: "Emma Weber",
      jurisdiction: "DE",
      status: "expiring",
      dueDate: "March 20, 2026",
      daysUntilDue: 41,
      priority: "high"
    },
    {
      type: "audit",
      title: "Labor Law Compliance Audit",
      jurisdiction: "FR",
      status: "pending",
      dueDate: "February 28, 2026",
      daysUntilDue: 21,
      priority: "high"
    },
    {
      type: "training",
      title: "Health & Safety Certification",
      employee: "Alex Chen",
      jurisdiction: "AU",
      status: "expiring",
      dueDate: "March 5, 2026",
      daysUntilDue: 26,
      priority: "medium"
    },
    {
      type: "permit",
      title: "Employment Pass Extension",
      employee: "Li Wei",
      jurisdiction: "SG",
      status: "compliant",
      dueDate: "August 12, 2026",
      daysUntilDue: 186,
      priority: "low"
    }
  ];

  try {
    // Check if data already exists
    const existing = await api.fetchComplianceItems();
    if (existing.success && existing.items.length > 0) {
      console.log('Compliance data already exists, skipping seed');
      return;
    }

    // Add each item
    for (const item of sampleData) {
      await api.addComplianceItem(item);
    }
    
    console.log('Successfully seeded compliance data');
  } catch (error) {
    console.error('Error seeding compliance data:', error);
  }
}

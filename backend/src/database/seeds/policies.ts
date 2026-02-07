import { PolicyModel } from '../models/Policy.js';
import { logger } from '../../middleware/logger.js';
import { PolicyCategory } from '../../types/policy.types.js';
import { Jurisdiction } from '../../types/employee.types.js';

interface PolicySeed {
  category: PolicyCategory;
  title: string;
  content: string;
  jurisdiction?: Jurisdiction;
  effective_date: string;
}

// ============================================
// MALAYSIA (MY) POLICIES
// ============================================
const malaysiaPolicies: PolicySeed[] = [
  {
    category: 'leave',
    title: 'Malaysia Annual Leave Policy',
    content: `# Annual Leave Policy - Malaysia

## Entitlement
Under the Employment Act 1955, all employees are entitled to paid annual leave based on years of service:

- **Less than 2 years service**: 8 days per year
- **2 to 5 years service**: 12 days per year  
- **More than 5 years service**: 16 days per year

## Accrual
Annual leave is accrued on a pro-rata basis from your start date. Leave entitlement for the first year is calculated proportionally.

## Carry Forward
Unused annual leave may be carried forward to the next year, subject to management approval. Maximum carry forward is typically 5 days unless otherwise approved.

## Application Process
1. Submit leave request through the HR portal at least 7 days in advance
2. For leave exceeding 5 consecutive days, submit 14 days in advance
3. Manager approval is required before leave is confirmed

## Public Holidays
Malaysia observes 11 gazetted public holidays. If a public holiday falls on a rest day, the following working day shall be a paid holiday.

## Contact
For questions, contact HR at hr@company.com`,
    jurisdiction: 'MY',
    effective_date: '2024-01-01',
  },
  {
    category: 'leave',
    title: 'Malaysia Sick Leave Policy',
    content: `# Sick Leave Policy - Malaysia

## Entitlement
Under the Employment Act 1955, employees are entitled to paid sick leave:

- **Less than 2 years service**: 14 days per year
- **2 to 5 years service**: 18 days per year
- **More than 5 years service**: 22 days per year

## Hospitalization Leave
In addition to outpatient sick leave, employees are entitled to 60 days of hospitalization leave per year.

## Medical Certificate
- Sick leave of 2 days or more requires a medical certificate (MC) from a registered medical practitioner
- The MC must be submitted within 48 hours of returning to work

## Extended Illness
For illness exceeding the statutory entitlement, employees may apply for unpaid sick leave or use annual leave with HR approval.

## Contact
Report illness to your manager as soon as possible and submit MC through the HR portal.`,
    jurisdiction: 'MY',
    effective_date: '2024-01-01',
  },
  {
    category: 'benefits',
    title: 'Malaysia Statutory Benefits (EPF, SOCSO, EIS)',
    content: `# Statutory Benefits - Malaysia

## EPF (Employees Provident Fund)
EPF is a mandatory retirement savings scheme:

**Contribution Rates (2024):**
- Employee: 11% of monthly wages
- Employer: 12% (for wages > RM5,000) or 13% (for wages ≤ RM5,000)

You can check your EPF balance at i-Akaun (https://www.kwsp.gov.my/)

## SOCSO (Social Security Organization)
SOCSO provides protection through two schemes:

**Employment Injury Scheme:**
- Employer contribution: 1.25% of wages
- Covers work-related injuries and occupational diseases

**Invalidity Scheme:**
- Employer: 0.5%, Employee: 0.5% of wages
- Covers invalidity or death not due to work

Wage ceiling: RM5,000/month

## EIS (Employment Insurance System)
EIS provides financial assistance if you lose your job:
- Employee: 0.2% of wages
- Employer: 0.2% of wages
- Wage ceiling: RM5,000/month

## Contact
HR can provide more details about your contribution statements.`,
    jurisdiction: 'MY',
    effective_date: '2024-01-01',
  },
  {
    category: 'expense',
    title: 'Malaysia Expense Reimbursement Policy',
    content: `# Expense Reimbursement Policy - Malaysia

## Covered Expenses
The following business expenses are reimbursable:
- Travel (flights, mileage, parking, tolls)
- Accommodation for business trips
- Meals during business travel
- Client entertainment (with prior approval)
- Office supplies
- Professional development

## Limits
- Domestic flights: Economy class
- International flights: Economy (up to 6 hours), Business (over 6 hours with approval)
- Hotel: Maximum RM400/night in KL, RM300/night elsewhere
- Meals: RM100/day during travel
- Mileage: RM0.60/km

## Submission
1. Submit claims within 30 days of expense
2. Attach original receipts or clear scans
3. Use expense report form in HR portal
4. Manager approval required for amounts over RM500

## Payment
Approved expenses are reimbursed in the next payroll cycle.`,
    jurisdiction: 'MY',
    effective_date: '2024-01-01',
  },
];

// ============================================
// SINGAPORE (SG) POLICIES
// ============================================
const singaporePolicies: PolicySeed[] = [
  {
    category: 'leave',
    title: 'Singapore Annual Leave Policy',
    content: `# Annual Leave Policy - Singapore

## Entitlement
Under the Employment Act, annual leave entitlement increases with service:

| Year of Service | Days |
|-----------------|------|
| 1st year | 7 days |
| 2nd year | 8 days |
| 3rd year | 9 days |
| 4th year | 10 days |
| 5th year | 11 days |
| 6th year | 12 days |
| 7th year | 13 days |
| 8th year onwards | 14 days |

## Pro-Ration
For employees who resign or are terminated before completing a full year, annual leave is pro-rated based on completed months.

## Childcare Leave
Parents with children under 7 years old: 6 days paid childcare leave per year
Parents with children under 2 years old: Additional 2 days unpaid infant care leave

## Application
Submit leave requests via the HR system at least 5 working days in advance (2 weeks for extended leave).

## Public Holidays
Singapore has 11 gazetted public holidays. If a holiday falls on a rest day, the next working day is a holiday.`,
    jurisdiction: 'SG',
    effective_date: '2024-01-01',
  },
  {
    category: 'leave',
    title: 'Singapore Sick Leave Policy',
    content: `# Sick Leave Policy - Singapore

## Entitlement
Employees are entitled to paid sick leave after 3 months of service:

- **Outpatient sick leave**: 14 days per year
- **Hospitalization leave**: 60 days per year (inclusive of outpatient days)

## Medical Certificate
- All sick leave must be supported by a medical certificate (MC) from a registered doctor
- MCs from polyclinics, hospitals, and registered clinics are accepted

## Notification
- Notify your manager before work start time
- Submit MC through the HR portal within 2 days of returning

## Extended Medical Leave
For illness exceeding statutory entitlement, discuss with HR about options including unpaid leave or medical insurance claims.`,
    jurisdiction: 'SG',
    effective_date: '2024-01-01',
  },
  {
    category: 'benefits',
    title: 'Singapore CPF Contribution Policy',
    content: `# CPF (Central Provident Fund) Policy - Singapore

## Overview
CPF is Singapore's mandatory social security savings scheme covering retirement, healthcare, and housing needs.

## Contribution Rates (2024)
For employees earning more than $750/month:

| Age Group | Employee | Employer | Total |
|-----------|----------|----------|-------|
| 55 and below | 20% | 17% | 37% |
| 55-60 | 16% | 15% | 31% |
| 60-65 | 10.5% | 11.5% | 22% |
| 65-70 | 7.5% | 9% | 16.5% |
| Above 70 | 5% | 7.5% | 12.5% |

## Wage Ceiling
- Ordinary Wage ceiling: $6,800/month
- Additional Wage ceiling: $102,000/year (minus ordinary wages)

## CPF Accounts
Your contributions are allocated to three accounts:
- Ordinary Account (OA): Housing, education, investments
- Special Account (SA): Retirement
- Medisave Account (MA): Healthcare

## Access
Check your CPF statements at my.cpf.gov.sg`,
    jurisdiction: 'SG',
    effective_date: '2024-01-01',
  },
  {
    category: 'expense',
    title: 'Singapore Expense Reimbursement Policy',
    content: `# Expense Reimbursement Policy - Singapore

## Covered Expenses
Reimbursable business expenses include:
- Transportation (flights, taxi, private hire, MRT, parking)
- Accommodation for business trips
- Meals during official travel
- Client entertainment (pre-approved)
- Professional development and certifications

## Limits
- Domestic taxi/Grab: No limit (with receipts)
- Regional flights: Economy class
- Long-haul flights: Business class (with Director approval)
- Hotel: Up to $300 SGD/night (Singapore), market rates for overseas
- Meals: $80 SGD/day during travel
- Client entertainment: $150 SGD/person (pre-approval required)

## Submission Process
1. Submit expense claims within 60 days
2. Attach all receipts (originals or clear photos)
3. Use the expense module in HR portal
4. Expenses over $500 require manager approval

## Payment
Approved claims are processed in the next payroll cycle.`,
    jurisdiction: 'SG',
    effective_date: '2024-01-01',
  },
];

// ============================================
// UNITED KINGDOM (UK) POLICIES
// ============================================
const ukPolicies: PolicySeed[] = [
  {
    category: 'leave',
    title: 'UK Annual Leave Policy',
    content: `# Annual Leave Policy - United Kingdom

## Statutory Entitlement
All workers are legally entitled to 5.6 weeks (28 days) of paid holiday per year. This can include bank holidays at the employer's discretion.

Our company provides:
- 25 days annual leave PLUS
- 8 bank holidays
- Total: 33 days paid time off

## Accrual
Leave accrues from your first day of employment at a rate of 2.33 days per month (28 days ÷ 12).

## Carry Forward
You may carry forward up to 5 days of unused leave to the following year. Carried leave must be used by 31 March.

## Booking Leave
- Submit requests via the HR portal
- Minimum 2 weeks notice for 1 week of leave
- Minimum 4 weeks notice for 2+ weeks
- Peak periods (summer, Christmas) may have restrictions

## Part-Time Workers
Annual leave is calculated pro-rata based on your contracted hours.

## Bank Holidays 2024
New Year's Day, Good Friday, Easter Monday, Early May Bank Holiday, Spring Bank Holiday, Summer Bank Holiday, Christmas Day, Boxing Day`,
    jurisdiction: 'UK',
    effective_date: '2024-04-01',
  },
  {
    category: 'leave',
    title: 'UK Sick Leave and SSP Policy',
    content: `# Sick Leave and Statutory Sick Pay (SSP) - United Kingdom

## Statutory Sick Pay (SSP)
If you're too ill to work, you're entitled to SSP:
- Rate: £116.75 per week (2024/25)
- Duration: Up to 28 weeks
- Waiting period: First 3 days are unpaid (waiting days)

## Eligibility
To qualify for SSP you must:
- Be off work sick for 4+ consecutive days
- Earn at least £123 per week on average
- Notify your employer within the required timeframe

## Company Sick Pay
Our company provides enhanced sick pay:
- First 5 days: Full pay
- Days 6-20: 50% pay plus SSP
- Beyond 20 days: SSP only

## Notification
- Contact your manager before your usual start time
- If sick for 7+ days, provide a fit note from your GP
- For absences under 7 days, complete a self-certification form upon return

## Return to Work
After any sick absence, you'll have a return-to-work discussion with your manager.`,
    jurisdiction: 'UK',
    effective_date: '2024-04-06',
  },
  {
    category: 'benefits',
    title: 'UK Pension Auto-Enrolment Policy',
    content: `# Workplace Pension - United Kingdom

## Auto-Enrolment
By law, we automatically enrol eligible workers into our workplace pension scheme.

## Eligibility
You'll be auto-enrolled if you:
- Are aged 22 or over
- Are under State Pension age
- Earn more than £10,000 per year
- Work in the UK

## Contribution Rates
Minimum contributions on qualifying earnings (£6,240 - £50,270):

| Contributor | Minimum Rate |
|-------------|-------------|
| Employee | 5% |
| Employer | 3% |
| **Total** | **8%** |

Our company contributes 5% (above minimum), bringing total to 10%.

## Opting Out
You can opt out within one month of being enrolled. You'll receive a refund of contributions. However, you'll miss out on employer contributions and tax relief.

## Tax Relief
Your pension contributions receive tax relief:
- Basic rate taxpayer: 20% relief
- Higher rate taxpayer: 40% relief (claim via tax return)

## Provider
Our pension is with [Provider Name]. Access your account at [portal URL].`,
    jurisdiction: 'UK',
    effective_date: '2024-04-06',
  },
  {
    category: 'expense',
    title: 'UK Expense Reimbursement Policy',
    content: `# Expense Reimbursement Policy - United Kingdom

## Reimbursable Expenses
Business expenses that can be claimed:
- Travel (rail, flights, mileage, parking, congestion charge)
- Accommodation for business trips
- Subsistence (meals) during travel
- Client entertainment (pre-approved)
- Professional subscriptions
- Working from home allowance

## Limits and Rates
- Mileage: 45p/mile (first 10,000 miles), 25p/mile thereafter
- Rail: Standard class (First class for journeys over 2 hours with approval)
- Flights: Economy (Business for intercontinental with Director approval)
- Hotels: £150/night (London), £120/night (elsewhere UK)
- Meals: £50/day (travel), £10/day (working from home)

## Submission
1. Submit claims within 3 months
2. Attach all receipts
3. Use Concur/expense system
4. Claims over £250 require manager approval

## Tax Implications
Some expenses may be taxable benefits (P11D). HR will advise if applicable.`,
    jurisdiction: 'UK',
    effective_date: '2024-04-01',
  },
];

// ============================================
// UNITED STATES (US) POLICIES
// ============================================
const usPolicies: PolicySeed[] = [
  {
    category: 'leave',
    title: 'US Paid Time Off (PTO) Policy',
    content: `# Paid Time Off (PTO) Policy - United States

## Overview
Our company offers a combined PTO policy that includes vacation, sick time, and personal days.

## PTO Accrual
PTO accrues based on years of service:

| Years of Service | Annual PTO | Accrual Rate |
|------------------|------------|--------------|
| 0-2 years | 15 days | 1.25 days/month |
| 3-5 years | 20 days | 1.67 days/month |
| 6+ years | 25 days | 2.08 days/month |

## Holidays
The company observes 10 paid holidays:
New Year's Day, MLK Day, Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Thanksgiving (2 days), Christmas

## Usage
- PTO can be used in minimum 4-hour increments
- Submit requests at least 5 business days in advance
- Extended leave (5+ days) requires 2 weeks notice

## Carry Forward
Up to 5 days may be carried to the following year. Unused PTO beyond 5 days is forfeited on December 31.

## Payout
Unused PTO is paid out upon termination in accordance with state law.

*Note: California employees are not subject to "use it or lose it" policies per state law.*`,
    jurisdiction: 'US',
    effective_date: '2024-01-01',
  },
  {
    category: 'leave',
    title: 'US FMLA Leave Policy',
    content: `# Family and Medical Leave Act (FMLA) Policy - United States

## Overview
FMLA provides eligible employees up to 12 weeks of unpaid, job-protected leave per year.

## Eligibility
You're eligible if you have:
- Worked for the company for 12 months
- Worked at least 1,250 hours in the past 12 months
- Work at a location with 50+ employees within 75 miles

## Qualifying Reasons
FMLA leave can be taken for:
1. Birth and care of a newborn child
2. Placement of a child for adoption or foster care
3. Care for an immediate family member with a serious health condition
4. Medical leave for a serious health condition
5. Military family leave

## Benefits During Leave
- Health insurance continues (you pay your portion)
- Job protection - return to same or equivalent position
- Leave may be taken intermittently when medically necessary

## Notification
- Foreseeable leave: 30 days advance notice
- Unforeseeable leave: As soon as practicable
- Medical certification may be required

## State Laws
Some states (California, New York, New Jersey, etc.) have additional paid family leave programs. Contact HR for details.`,
    jurisdiction: 'US',
    effective_date: '2024-01-01',
  },
  {
    category: 'leave',
    title: 'California Paid Sick Leave Policy',
    content: `# California Paid Sick Leave Policy

## Entitlement
California law requires at least 5 days (40 hours) of paid sick leave per year.

Our company provides 10 days (80 hours) of sick leave annually.

## Accrual
Sick leave accrues at 1 hour for every 30 hours worked, usable after 90 days of employment.

## Permitted Uses
Sick leave can be used for:
- Your own health condition
- Care for a family member
- Preventive care appointments
- Domestic violence, sexual assault, or stalking issues

## Family Members
Under California law, "family member" includes:
- Spouse/domestic partner
- Children (biological, adopted, foster, stepchildren)
- Parents, grandparents, grandchildren
- Siblings
- Designated person (one individual per year)

## Usage
- Minimum increment: 2 hours
- No advance notice required for illness
- Doctor's note may be requested for absences of 3+ consecutive days

## No Retaliation
The company prohibits retaliation against employees who use sick leave.`,
    jurisdiction: 'US',
    effective_date: '2024-01-01',
  },
  {
    category: 'benefits',
    title: 'US 401(k) Retirement Plan Policy',
    content: `# 401(k) Retirement Plan - United States

## Plan Overview
We offer a 401(k) retirement savings plan to help you save for the future.

## Eligibility
- Eligible after 90 days of employment
- Must be 21 years or older
- Automatic enrollment at 3% (you can change or opt out)

## Contribution Limits (2024)
- Employee limit: $23,000/year
- Catch-up contribution (age 50+): Additional $7,500
- Total combined (employee + employer): $69,000

## Employer Match
We match 100% of the first 4% you contribute:
- You contribute 4% → We contribute 4%
- Total: 8% of your salary going to retirement

## Vesting Schedule
Employer contributions vest over 4 years:
- Year 1: 25%
- Year 2: 50%
- Year 3: 75%
- Year 4: 100%

Your own contributions are always 100% vested.

## Investment Options
Choose from a variety of investment options including target-date funds, index funds, and individual funds.

## Access
Manage your account at [provider portal URL].`,
    jurisdiction: 'US',
    effective_date: '2024-01-01',
  },
  {
    category: 'benefits',
    title: 'US Health Insurance Policy',
    content: `# Health Insurance Benefits - United States

## Coverage
We offer comprehensive medical, dental, and vision insurance to all full-time employees (30+ hours/week).

## Plan Options
**Medical:**
- PPO Plan: Higher premiums, more flexibility
- HDHP with HSA: Lower premiums, tax-advantaged savings

**Dental:**
- Preventive care: 100% covered
- Basic services: 80% covered
- Major services: 50% covered

**Vision:**
- Annual exam: Covered
- Frames/lenses or contacts: Annual allowance

## Eligibility
- Coverage begins first of month following 30 days of employment
- Dependents (spouse, children under 26) can be added
- Domestic partners eligible where legally recognized

## Costs
Premiums are deducted pre-tax from each paycheck. 
Company pays approximately 80% of employee-only premiums.

## HSA Contribution
If you choose the HDHP, you can contribute to a Health Savings Account:
- 2024 limits: $4,150 (individual), $8,300 (family)
- Company contributes $500/year to your HSA

## COBRA
If you leave the company, you can continue coverage for up to 18 months under COBRA (at your expense).`,
    jurisdiction: 'US',
    effective_date: '2024-01-01',
  },
  {
    category: 'expense',
    title: 'US Expense Reimbursement Policy',
    content: `# Expense Reimbursement Policy - United States

## Covered Expenses
The company reimburses reasonable business expenses:
- Air travel (economy class, or business for 6+ hour flights with approval)
- Ground transportation (rental car, rideshare, mileage)
- Lodging
- Meals during business travel
- Client entertainment (pre-approved)
- Professional development

## Limits
- Mileage: $0.67/mile (IRS 2024 rate)
- Lodging: $200/night (higher in major cities with approval)
- Meals: $75/day (or actual reasonable costs)
- Rideshare/taxi: Actual costs
- Client entertainment: $100/person (requires pre-approval)

## Submission
1. Submit expenses within 60 days
2. Use Expensify/Concur
3. Attach itemized receipts for all expenses over $25
4. Manager approval required for all submissions

## Non-Reimbursable
- Personal items
- Traffic violations
- Alcohol (except for approved client entertainment)
- First-class travel (unless medically necessary)
- Spouse/family travel expenses

## Payment
Approved expenses are reimbursed via direct deposit within 2 weeks.`,
    jurisdiction: 'US',
    effective_date: '2024-01-01',
  },
];

// ============================================
// GLOBAL POLICIES (Apply to all jurisdictions)
// ============================================
const globalPolicies: PolicySeed[] = [
  {
    category: 'code_of_conduct',
    title: 'Global Code of Conduct',
    content: `# Code of Conduct

## Our Values
We are committed to maintaining a respectful, inclusive, and ethical workplace.

## Expected Behavior
- Treat all colleagues with respect and dignity
- Communicate professionally and constructively
- Maintain confidentiality of company and employee information
- Report conflicts of interest
- Comply with all applicable laws and regulations

## Prohibited Conduct
- Harassment or discrimination of any kind
- Retaliation against those who report concerns
- Theft, fraud, or dishonesty
- Use of company resources for personal gain
- Violation of data protection policies

## Reporting Concerns
If you witness or experience any violation:
1. Report to your manager
2. Contact HR directly
3. Use the anonymous ethics hotline: [number]

## Non-Retaliation
We prohibit retaliation against anyone who reports concerns in good faith.`,
    effective_date: '2024-01-01',
  },
  {
    category: 'remote_work',
    title: 'Global Remote Work Policy',
    content: `# Remote Work Policy

## Eligibility
Remote work arrangements may be available based on:
- Job requirements
- Performance history
- Manager approval
- Local regulations

## Types of Remote Work
1. **Fully Remote**: Work from home 100% of time
2. **Hybrid**: Split between office and home (typically 2-3 days each)
3. **Occasional**: Remote work as needed with manager approval

## Requirements
- Maintain reliable internet connection
- Have a dedicated workspace
- Be available during core hours (10am-3pm local time)
- Attend required in-person meetings
- Respond to communications within reasonable timeframes

## Equipment
Company provides:
- Laptop/computer
- Necessary software licenses
- One-time home office stipend (varies by location)

## Expenses
Remote workers may be eligible for reimbursement of:
- Internet (portion used for work)
- Home office supplies
- Ergonomic equipment

## Security
- Use company VPN for all work
- Secure your home network
- Lock screen when away
- Do not work from public spaces without appropriate precautions`,
    effective_date: '2024-01-01',
  },
  {
    category: 'promotion',
    title: 'Career Development and Promotion Policy',
    content: `# Career Development and Promotion Policy

## Promotion Criteria
Promotions are based on:
1. Consistent demonstration of skills at the next level
2. Achievement of performance goals
3. Leadership and collaboration
4. Business need and headcount
5. Tenure (minimum 12 months in current role for most positions)

## Performance Reviews
- Formal reviews: Annually (Q1)
- Check-ins: Quarterly
- 360 feedback: For senior roles

## Promotion Process
1. Self-assessment and discussion with manager
2. Manager nomination
3. Calibration with leadership team
4. HR review for equity and consistency
5. Final approval and communication

## Salary Adjustments
Promotions typically include:
- Title change
- Salary increase (typically 10-20%)
- Updated responsibilities
- New goals and expectations

## Career Paths
We support both:
- **Individual Contributor**: Technical expertise track
- **Management**: People leadership track

## Development Resources
- Learning & Development budget
- Mentorship programs
- Internal mobility opportunities
- Skills training and certifications`,
    effective_date: '2024-01-01',
  },
];

export async function seedPolicies(): Promise<void> {
  logger.info('Starting policy seeding...');
  
  try {
    // Clear existing policies
    await PolicyModel.deleteAll();
    logger.info('Cleared existing policies');

    // Combine all policies
    const allPolicies = [
      ...malaysiaPolicies,
      ...singaporePolicies,
      ...ukPolicies,
      ...usPolicies,
      ...globalPolicies,
    ];
    
    // Seed all policies
    for (const policy of allPolicies) {
      await PolicyModel.create(policy);
    }
    
    logger.info(`Seeded ${allPolicies.length} policies:`);
    logger.info(`  - Malaysia: ${malaysiaPolicies.length} policies`);
    logger.info(`  - Singapore: ${singaporePolicies.length} policies`);
    logger.info(`  - UK: ${ukPolicies.length} policies`);
    logger.info(`  - US: ${usPolicies.length} policies`);
    logger.info(`  - Global: ${globalPolicies.length} policies`);
    
  } catch (error) {
    logger.error('Failed to seed policies:', error);
    throw error;
  }
}

export { malaysiaPolicies, singaporePolicies, ukPolicies, usPolicies, globalPolicies };

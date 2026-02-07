import { LabourLawModel } from '../models/LabourLaw.js';
import { logger } from '../../middleware/logger.js';
import { Jurisdiction } from '../../types/employee.types.js';
import { LawCategory } from '../../types/policy.types.js';

interface LabourLawSeed {
  jurisdiction: Jurisdiction;
  category: LawCategory;
  law_name: string;
  description: string;
  effective_date: string;
  source_url?: string;
  structured_data: Record<string, unknown>;
}

// ============================================
// MALAYSIA (MY) LABOUR LAWS
// ============================================
const malaysiaLaws: LabourLawSeed[] = [
  // Leave entitlements
  {
    jurisdiction: 'MY',
    category: 'leave',
    law_name: 'Annual Leave Entitlement',
    description: 'Under the Employment Act 1955, employees are entitled to paid annual leave based on years of service: 8 days for less than 2 years, 12 days for 2-5 years, and 16 days for more than 5 years of service.',
    effective_date: '2023-01-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'annual_leave',
      entitlements: [
        { years_of_service: '< 2 years', days: 8 },
        { years_of_service: '2-5 years', days: 12 },
        { years_of_service: '> 5 years', days: 16 },
      ],
      paid: true,
      carry_forward: 'Subject to employer policy',
    },
  },
  {
    jurisdiction: 'MY',
    category: 'leave',
    law_name: 'Sick Leave Entitlement',
    description: 'Employees are entitled to paid sick leave: 14 days for less than 2 years of service, 18 days for 2-5 years, and 22 days for more than 5 years. Hospitalization leave is 60 days per year.',
    effective_date: '2023-01-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'sick_leave',
      entitlements: [
        { years_of_service: '< 2 years', days: 14 },
        { years_of_service: '2-5 years', days: 18 },
        { years_of_service: '> 5 years', days: 22 },
      ],
      hospitalization_leave: 60,
      paid: true,
      requires_medical_certificate: true,
    },
  },
  {
    jurisdiction: 'MY',
    category: 'leave',
    law_name: 'Maternity Leave',
    description: 'Female employees are entitled to 98 consecutive days of paid maternity leave. The employee must have worked for the employer for at least 90 days in the 9 months before confinement.',
    effective_date: '2023-01-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'maternity_leave',
      days: 98,
      paid: true,
      eligibility: '90 days employment in 9 months before confinement',
      consecutive: true,
    },
  },
  {
    jurisdiction: 'MY',
    category: 'leave',
    law_name: 'Paternity Leave',
    description: 'Male employees in the private sector are entitled to 7 consecutive days of paid paternity leave for each confinement of their spouse, up to 5 confinements.',
    effective_date: '2023-01-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'paternity_leave',
      days: 7,
      paid: true,
      max_confinements: 5,
      consecutive: true,
    },
  },
  {
    jurisdiction: 'MY',
    category: 'leave',
    law_name: 'Public Holidays',
    description: 'Employees are entitled to 11 gazetted public holidays per year, including 5 compulsory holidays: National Day, Birthday of Yang di-Pertuan Agong, Birthday of Ruler/Federal Territory Day, Labour Day, and Malaysia Day.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'public_holidays',
      total_days: 11,
      compulsory: [
        'National Day (31 August)',
        'Birthday of Yang di-Pertuan Agong',
        'Birthday of Ruler/Federal Territory Day',
        'Labour Day (1 May)',
        'Malaysia Day (16 September)',
      ],
    },
  },
  // Wages
  {
    jurisdiction: 'MY',
    category: 'wages',
    law_name: 'Minimum Wage',
    description: 'The national minimum wage in Malaysia is RM1,500 per month or RM7.21 per hour for employees in all sectors.',
    effective_date: '2023-05-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'minimum_wage',
      monthly: 1500,
      hourly: 7.21,
      currency: 'MYR',
      coverage: 'All sectors nationwide',
    },
  },
  {
    jurisdiction: 'MY',
    category: 'wages',
    law_name: 'Overtime Pay',
    description: 'Overtime work is paid at 1.5x normal hourly rate on normal working days, 2x on rest days, and 3x on public holidays.',
    effective_date: '2023-01-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'overtime',
      rates: {
        normal_day: 1.5,
        rest_day: 2.0,
        public_holiday: 3.0,
      },
      max_hours: 104,
      period: 'per month',
    },
  },
  // Contributions
  {
    jurisdiction: 'MY',
    category: 'contributions',
    law_name: 'EPF (Employees Provident Fund)',
    description: 'EPF is a mandatory retirement savings scheme. Employees contribute 11% of monthly wages, while employers contribute 12% (for wages > RM5,000) or 13% (for wages ≤ RM5,000).',
    effective_date: '2024-01-01',
    source_url: 'https://www.kwsp.gov.my/',
    structured_data: {
      type: 'retirement_contribution',
      name: 'EPF',
      employee_rate: 11,
      employer_rate: {
        below_5000: 13,
        above_5000: 12,
      },
      wage_ceiling: null,
      mandatory: true,
    },
  },
  {
    jurisdiction: 'MY',
    category: 'contributions',
    law_name: 'SOCSO (Social Security Organization)',
    description: 'SOCSO provides social security protection to employees. Employment Injury Scheme: employer pays 1.25% of wages. Invalidity Scheme: employer 0.5% + employee 0.5% of wages. Applies to wages up to RM5,000.',
    effective_date: '2024-01-01',
    source_url: 'https://www.perkeso.gov.my/',
    structured_data: {
      type: 'social_security',
      name: 'SOCSO',
      schemes: {
        employment_injury: { employer_rate: 1.25 },
        invalidity: { employer_rate: 0.5, employee_rate: 0.5 },
      },
      wage_ceiling: 5000,
      currency: 'MYR',
      mandatory: true,
    },
  },
  {
    jurisdiction: 'MY',
    category: 'contributions',
    law_name: 'EIS (Employment Insurance System)',
    description: 'EIS provides financial assistance to workers who lose their jobs. Both employer and employee contribute 0.2% of monthly wages, up to a maximum insured salary of RM5,000.',
    effective_date: '2024-01-01',
    source_url: 'https://www.perkeso.gov.my/',
    structured_data: {
      type: 'employment_insurance',
      name: 'EIS',
      employee_rate: 0.2,
      employer_rate: 0.2,
      wage_ceiling: 5000,
      currency: 'MYR',
      mandatory: true,
    },
  },
  // Working Hours
  {
    jurisdiction: 'MY',
    category: 'working_hours',
    law_name: 'Working Hours Limit',
    description: 'Maximum working hours are 45 hours per week (reduced from 48 hours). Normal working hours should not exceed 8 hours per day. Employees must have at least one rest day per week.',
    effective_date: '2023-01-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'working_hours',
      max_weekly_hours: 45,
      max_daily_hours: 8,
      rest_days_per_week: 1,
    },
  },
  // Termination
  {
    jurisdiction: 'MY',
    category: 'termination',
    law_name: 'Notice Period and Termination Benefits',
    description: 'Notice period depends on length of service: 4 weeks for less than 2 years, 6 weeks for 2-5 years, 8 weeks for more than 5 years. Termination benefits are calculated based on service length.',
    effective_date: '2023-01-01',
    source_url: 'https://www.mohr.gov.my/index.php/en/',
    structured_data: {
      type: 'termination',
      notice_periods: [
        { years_of_service: '< 2 years', weeks: 4 },
        { years_of_service: '2-5 years', weeks: 6 },
        { years_of_service: '> 5 years', weeks: 8 },
      ],
      termination_benefits: [
        { years_of_service: '< 2 years', days_per_year: 10 },
        { years_of_service: '2-5 years', days_per_year: 15 },
        { years_of_service: '> 5 years', days_per_year: 20 },
      ],
    },
  },
];

// ============================================
// SINGAPORE (SG) LABOUR LAWS
// ============================================
const singaporeLaws: LabourLawSeed[] = [
  // Leave entitlements
  {
    jurisdiction: 'SG',
    category: 'leave',
    law_name: 'Annual Leave Entitlement',
    description: 'Under the Employment Act, employees are entitled to annual leave based on years of service: 7 days in the first year, increasing by 1 day each year up to 14 days maximum.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/leave',
    structured_data: {
      type: 'annual_leave',
      entitlements: [
        { year: 1, days: 7 },
        { year: 2, days: 8 },
        { year: 3, days: 9 },
        { year: 4, days: 10 },
        { year: 5, days: 11 },
        { year: 6, days: 12 },
        { year: 7, days: 13 },
        { year: '8+', days: 14 },
      ],
      paid: true,
      pro_rata: true,
    },
  },
  {
    jurisdiction: 'SG',
    category: 'leave',
    law_name: 'Sick Leave Entitlement',
    description: 'Employees are entitled to 14 days of paid outpatient sick leave and 60 days of paid hospitalization leave per year (inclusive of the 14 days outpatient sick leave).',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/leave/sick-leave',
    structured_data: {
      type: 'sick_leave',
      outpatient_days: 14,
      hospitalization_days: 60,
      paid: true,
      requires_medical_certificate: true,
      eligibility: '3 months of service',
    },
  },
  {
    jurisdiction: 'SG',
    category: 'leave',
    law_name: 'Maternity Leave',
    description: 'Eligible working mothers are entitled to 16 weeks of Government-Paid Maternity Leave (GPML). For the first two confinements, the employer pays the first 8 weeks and the government reimburses the last 8 weeks.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/leave/maternity-leave',
    structured_data: {
      type: 'maternity_leave',
      weeks: 16,
      paid: true,
      employer_paid_weeks: 8,
      government_paid_weeks: 8,
      eligibility: {
        service: '3 months before delivery',
        citizenship: 'Child is Singapore citizen',
      },
    },
  },
  {
    jurisdiction: 'SG',
    category: 'leave',
    law_name: 'Paternity Leave',
    description: 'Eligible working fathers are entitled to 2 weeks of Government-Paid Paternity Leave within 12 months of the child\'s birth.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/leave/paternity-leave',
    structured_data: {
      type: 'paternity_leave',
      weeks: 2,
      paid: true,
      government_funded: true,
      eligibility: {
        citizenship: 'Child is Singapore citizen',
        marriage: 'Lawfully married to mother',
      },
    },
  },
  {
    jurisdiction: 'SG',
    category: 'leave',
    law_name: 'Childcare Leave',
    description: 'Parents with children under 7 years old are entitled to 6 days of paid childcare leave per year if they have worked for 3+ months. An additional 2 days of unpaid infant care leave for children under 2.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/leave/childcare-leave',
    structured_data: {
      type: 'childcare_leave',
      paid_days: 6,
      child_age_limit: 7,
      infant_care_leave: 2,
      infant_age_limit: 2,
    },
  },
  {
    jurisdiction: 'SG',
    category: 'leave',
    law_name: 'Public Holidays',
    description: 'Singapore has 11 gazetted public holidays per year. If a public holiday falls on a rest day, the next working day will be a public holiday.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/public-holidays',
    structured_data: {
      type: 'public_holidays',
      total_days: 11,
      holidays: [
        "New Year's Day", "Chinese New Year (2 days)", "Good Friday",
        "Labour Day", "Hari Raya Puasa", "Vesak Day", "Hari Raya Haji",
        "National Day", "Deepavali", "Christmas Day"
      ],
    },
  },
  // Wages
  {
    jurisdiction: 'SG',
    category: 'wages',
    law_name: 'Progressive Wage Model (PWM)',
    description: 'Singapore uses the Progressive Wage Model instead of a national minimum wage. It sets minimum wages for specific sectors: Cleaning, Security, Landscape, Lift & Escalator, Retail, Food Services, and Waste Management.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/progressive-wage-model',
    structured_data: {
      type: 'minimum_wage',
      model: 'Progressive Wage Model',
      sectors: {
        cleaning: { base_wage: 1570, currency: 'SGD', monthly: true },
        security: { base_wage: 1850, currency: 'SGD', monthly: true },
        landscape: { base_wage: 1750, currency: 'SGD', monthly: true },
        retail: { base_wage: 1715, currency: 'SGD', monthly: true },
        food_services: { base_wage: 1600, currency: 'SGD', monthly: true },
      },
      local_qualifying_salary: 1600,
    },
  },
  // Contributions
  {
    jurisdiction: 'SG',
    category: 'contributions',
    law_name: 'CPF (Central Provident Fund)',
    description: 'CPF is a mandatory savings scheme. Contribution rates vary by age. For employees aged 55 and below earning >$750/month: Employee contributes 20%, Employer contributes 17% (total 37%).',
    effective_date: '2024-01-01',
    source_url: 'https://www.cpf.gov.sg/employer/employer-guides/paying-cpf-contributions',
    structured_data: {
      type: 'retirement_contribution',
      name: 'CPF',
      rates_by_age: [
        { age: '55 and below', employee: 20, employer: 17, total: 37 },
        { age: '55-60', employee: 16, employer: 15, total: 31 },
        { age: '60-65', employee: 10.5, employer: 11.5, total: 22 },
        { age: '65-70', employee: 7.5, employer: 9, total: 16.5 },
        { age: 'Above 70', employee: 5, employer: 7.5, total: 12.5 },
      ],
      wage_ceiling: 6800,
      additional_wage_ceiling: 102000,
      currency: 'SGD',
      mandatory: true,
    },
  },
  // Working Hours
  {
    jurisdiction: 'SG',
    category: 'working_hours',
    law_name: 'Working Hours Limit',
    description: 'Under the Employment Act, employees should not work more than 8 hours a day or 44 hours a week. Overtime is capped at 72 hours per month.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/hours-of-work-overtime-and-rest-days',
    structured_data: {
      type: 'working_hours',
      max_daily_hours: 8,
      max_weekly_hours: 44,
      max_overtime_monthly: 72,
      rest_day: 'One rest day per week',
    },
  },
  // Termination
  {
    jurisdiction: 'SG',
    category: 'termination',
    law_name: 'Notice Period',
    description: 'Notice period depends on employment contract. If not specified: 1 day notice during probation, 1 week for less than 26 weeks service, 2 weeks for 26 weeks to 2 years, 4 weeks for 2+ years.',
    effective_date: '2024-01-01',
    source_url: 'https://www.mom.gov.sg/employment-practices/termination-of-employment',
    structured_data: {
      type: 'termination',
      default_notice_periods: [
        { service: 'Probation', notice: '1 day' },
        { service: '< 26 weeks', notice: '1 week' },
        { service: '26 weeks to 2 years', notice: '2 weeks' },
        { service: '2+ years', notice: '4 weeks' },
      ],
    },
  },
];

// ============================================
// UNITED KINGDOM (UK) LABOUR LAWS
// ============================================
const ukLaws: LabourLawSeed[] = [
  // Leave entitlements
  {
    jurisdiction: 'UK',
    category: 'leave',
    law_name: 'Statutory Annual Leave',
    description: 'Full-time workers are entitled to 5.6 weeks (28 days) of paid holiday per year, which can include bank holidays. Part-time workers get a pro-rata amount.',
    effective_date: '2024-04-01',
    source_url: 'https://www.gov.uk/holiday-entitlement-rights',
    structured_data: {
      type: 'annual_leave',
      weeks: 5.6,
      days: 28,
      includes_bank_holidays: 'Employer discretion',
      paid: true,
      accrual: 'From first day of employment',
    },
  },
  {
    jurisdiction: 'UK',
    category: 'leave',
    law_name: 'Statutory Sick Pay (SSP)',
    description: 'Eligible employees receive Statutory Sick Pay of £116.75 per week for up to 28 weeks. You must be off work sick for 4 or more consecutive days to qualify.',
    effective_date: '2024-04-06',
    source_url: 'https://www.gov.uk/statutory-sick-pay',
    structured_data: {
      type: 'sick_leave',
      weekly_rate: 116.75,
      currency: 'GBP',
      max_weeks: 28,
      waiting_days: 3,
      minimum_earnings: 123,
      earnings_period: 'per week',
    },
  },
  {
    jurisdiction: 'UK',
    category: 'leave',
    law_name: 'Statutory Maternity Leave',
    description: 'Eligible employees are entitled to 52 weeks maternity leave: 26 weeks Ordinary Maternity Leave + 26 weeks Additional Maternity Leave. Statutory Maternity Pay is 90% of average weekly earnings for 6 weeks, then £184.03 or 90% (whichever is lower) for 33 weeks.',
    effective_date: '2024-04-06',
    source_url: 'https://www.gov.uk/maternity-pay-leave',
    structured_data: {
      type: 'maternity_leave',
      total_weeks: 52,
      ordinary_leave: 26,
      additional_leave: 26,
      pay: {
        first_6_weeks: '90% of average weekly earnings',
        remaining_33_weeks: { rate: 184.03, currency: 'GBP', or_percentage: 90 },
      },
    },
  },
  {
    jurisdiction: 'UK',
    category: 'leave',
    law_name: 'Statutory Paternity Leave',
    description: 'Eligible employees can take 1 or 2 weeks of paternity leave. Statutory Paternity Pay is £184.03 per week or 90% of average weekly earnings (whichever is lower).',
    effective_date: '2024-04-06',
    source_url: 'https://www.gov.uk/paternity-pay-leave',
    structured_data: {
      type: 'paternity_leave',
      weeks: 2,
      weekly_rate: 184.03,
      currency: 'GBP',
      or_percentage: 90,
    },
  },
  {
    jurisdiction: 'UK',
    category: 'leave',
    law_name: 'Bank Holidays',
    description: 'There are 8 permanent bank holidays in England and Wales. Employers can choose whether to include bank holidays as part of the 28-day statutory leave entitlement.',
    effective_date: '2024-01-01',
    source_url: 'https://www.gov.uk/bank-holidays',
    structured_data: {
      type: 'public_holidays',
      total_days: 8,
      holidays: [
        "New Year's Day", "Good Friday", "Easter Monday", "Early May Bank Holiday",
        "Spring Bank Holiday", "Summer Bank Holiday", "Christmas Day", "Boxing Day"
      ],
      included_in_statutory: 'Employer discretion',
    },
  },
  // Wages
  {
    jurisdiction: 'UK',
    category: 'wages',
    law_name: 'National Minimum Wage and Living Wage',
    description: 'The National Living Wage for workers aged 21+ is £11.44 per hour from April 2024. Age-tiered rates apply: 18-20: £8.60, Under 18: £6.40, Apprentice: £6.40.',
    effective_date: '2024-04-01',
    source_url: 'https://www.gov.uk/national-minimum-wage-rates',
    structured_data: {
      type: 'minimum_wage',
      rates: [
        { age: '21 and over', hourly: 11.44, name: 'National Living Wage' },
        { age: '18-20', hourly: 8.60 },
        { age: 'Under 18', hourly: 6.40 },
        { age: 'Apprentice', hourly: 6.40 },
      ],
      currency: 'GBP',
    },
  },
  // Contributions
  {
    jurisdiction: 'UK',
    category: 'contributions',
    law_name: 'National Insurance Contributions',
    description: 'Employees pay Class 1 National Insurance: 12% on earnings between £242-£967 per week, 2% on earnings above £967 per week. Employers pay 13.8% on earnings above £175 per week.',
    effective_date: '2024-04-06',
    source_url: 'https://www.gov.uk/national-insurance',
    structured_data: {
      type: 'social_security',
      name: 'National Insurance',
      employee_rates: [
        { threshold: '£242-£967/week', rate: 12 },
        { threshold: 'Above £967/week', rate: 2 },
      ],
      employer_rate: 13.8,
      employer_threshold: 175,
      currency: 'GBP',
    },
  },
  {
    jurisdiction: 'UK',
    category: 'contributions',
    law_name: 'Workplace Pension Auto-Enrolment',
    description: 'Employers must automatically enrol eligible workers into a workplace pension. Minimum total contribution is 8% of qualifying earnings: employer minimum 3%, employee minimum 5%.',
    effective_date: '2024-04-06',
    source_url: 'https://www.gov.uk/workplace-pensions',
    structured_data: {
      type: 'pension',
      name: 'Auto-Enrolment Pension',
      minimum_contributions: {
        employer: 3,
        employee: 5,
        total: 8,
      },
      qualifying_earnings: {
        lower_threshold: 6240,
        upper_threshold: 50270,
        period: 'per year',
        currency: 'GBP',
      },
      eligibility: {
        age: '22 to State Pension age',
        earnings: 'Above £10,000/year',
      },
    },
  },
  // Working Hours
  {
    jurisdiction: 'UK',
    category: 'working_hours',
    law_name: 'Working Time Regulations',
    description: 'Workers should not work more than 48 hours per week on average (can opt out). Entitled to 11 consecutive hours rest per day, 24 hours uninterrupted rest per week, and a 20-minute break if working more than 6 hours.',
    effective_date: '2024-01-01',
    source_url: 'https://www.gov.uk/maximum-weekly-working-hours',
    structured_data: {
      type: 'working_hours',
      max_weekly_hours: 48,
      opt_out_available: true,
      daily_rest: 11,
      weekly_rest: 24,
      break_after_hours: 6,
      break_duration: 20,
    },
  },
  // Termination
  {
    jurisdiction: 'UK',
    category: 'termination',
    law_name: 'Statutory Notice Period',
    description: 'Statutory minimum notice: 1 week if employed 1 month to 2 years, then 1 week for each year of service (up to 12 weeks maximum). Employees must give at least 1 week notice.',
    effective_date: '2024-01-01',
    source_url: 'https://www.gov.uk/handing-in-your-notice',
    structured_data: {
      type: 'termination',
      employer_notice: [
        { service: '1 month to 2 years', weeks: 1 },
        { service: '2-12 years', weeks: '1 per year of service' },
        { service: '12+ years', weeks: 12 },
      ],
      employee_notice: '1 week minimum',
    },
  },
  {
    jurisdiction: 'UK',
    category: 'termination',
    law_name: 'Statutory Redundancy Pay',
    description: 'Employees with 2+ years of service are entitled to statutory redundancy pay: 0.5 week for each year under 22, 1 week for each year aged 22-40, 1.5 weeks for each year aged 41+. Weekly pay capped at £700.',
    effective_date: '2024-04-06',
    source_url: 'https://www.gov.uk/redundancy-your-rights',
    structured_data: {
      type: 'redundancy',
      eligibility: '2 years service',
      calculation: [
        { age: 'Under 22', weeks_per_year: 0.5 },
        { age: '22-40', weeks_per_year: 1 },
        { age: '41+', weeks_per_year: 1.5 },
      ],
      weekly_pay_cap: 700,
      max_years: 20,
      currency: 'GBP',
    },
  },
];

// ============================================
// UNITED STATES (US) LABOUR LAWS
// ============================================
const usLaws: LabourLawSeed[] = [
  // Leave entitlements
  {
    jurisdiction: 'US',
    category: 'leave',
    law_name: 'Family and Medical Leave Act (FMLA)',
    description: 'FMLA provides eligible employees up to 12 weeks of unpaid, job-protected leave per year for specified family and medical reasons. Applies to employers with 50+ employees.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dol.gov/agencies/whd/fmla',
    structured_data: {
      type: 'family_leave',
      name: 'FMLA',
      weeks: 12,
      paid: false,
      job_protected: true,
      eligibility: {
        employer_size: 50,
        service: '12 months',
        hours_worked: 1250,
      },
      covered_reasons: [
        'Birth/care of newborn',
        'Placement of child for adoption/foster care',
        'Care for immediate family with serious health condition',
        "Employee's serious health condition",
      ],
    },
  },
  {
    jurisdiction: 'US',
    category: 'leave',
    law_name: 'Paid Time Off (PTO) - No Federal Mandate',
    description: 'There is no federal requirement for paid vacation or sick leave. Typical private sector employers offer 10-15 days PTO annually, with more for senior employees. Several states have mandatory paid sick leave laws.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dol.gov/general/topic/workhours/vacation_leave',
    structured_data: {
      type: 'annual_leave',
      federal_mandate: false,
      typical_range: {
        entry_level: '10 days',
        mid_career: '15 days',
        senior: '20+ days',
      },
      states_with_mandatory_sick_leave: [
        'California', 'Colorado', 'Connecticut', 'Maryland', 'Massachusetts',
        'Michigan', 'New Jersey', 'New Mexico', 'New York', 'Oregon',
        'Rhode Island', 'Vermont', 'Washington', 'Washington D.C.'
      ],
    },
  },
  {
    jurisdiction: 'US',
    category: 'leave',
    law_name: 'California Paid Sick Leave',
    description: 'California requires employers to provide at least 5 days (40 hours) of paid sick leave per year. Employees accrue 1 hour for every 30 hours worked, usable after 90 days of employment.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dir.ca.gov/dlse/paid_sick_leave.htm',
    structured_data: {
      type: 'sick_leave',
      state: 'California',
      days: 5,
      hours: 40,
      accrual: '1 hour per 30 hours worked',
      usable_after: 90,
      paid: true,
    },
  },
  {
    jurisdiction: 'US',
    category: 'leave',
    law_name: 'Federal Holidays',
    description: 'There are 11 federal holidays recognized by the US government. Private employers are not required to provide paid time off for federal holidays, though many do.',
    effective_date: '2024-01-01',
    source_url: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/',
    structured_data: {
      type: 'public_holidays',
      total_days: 11,
      holidays: [
        "New Year's Day", "Martin Luther King Jr. Day", "Presidents' Day",
        "Memorial Day", "Juneteenth", "Independence Day", "Labor Day",
        "Columbus Day", "Veterans Day", "Thanksgiving Day", "Christmas Day"
      ],
      mandatory_for_private: false,
    },
  },
  // Wages
  {
    jurisdiction: 'US',
    category: 'wages',
    law_name: 'Federal Minimum Wage (FLSA)',
    description: 'The federal minimum wage under the Fair Labor Standards Act is $7.25 per hour. Many states and cities have higher minimum wages. Tipped employees minimum is $2.13/hour if tips bring total to federal minimum.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dol.gov/agencies/whd/minimum-wage',
    structured_data: {
      type: 'minimum_wage',
      federal: 7.25,
      tipped: 2.13,
      currency: 'USD',
      hourly: true,
    },
  },
  {
    jurisdiction: 'US',
    category: 'wages',
    law_name: 'California Minimum Wage',
    description: 'California minimum wage is $16.00 per hour for all employers (as of January 2024). Some cities like San Francisco and Los Angeles have higher local minimums.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dir.ca.gov/dlse/faq_minimumwage.htm',
    structured_data: {
      type: 'minimum_wage',
      state: 'California',
      hourly: 16.00,
      currency: 'USD',
      local_variations: {
        san_francisco: 18.07,
        los_angeles: 16.78,
        san_jose: 17.55,
      },
    },
  },
  {
    jurisdiction: 'US',
    category: 'wages',
    law_name: 'Overtime Pay (FLSA)',
    description: 'Non-exempt employees must receive overtime pay of at least 1.5x regular rate for hours worked over 40 in a workweek. California requires daily overtime: 1.5x after 8 hours, 2x after 12 hours.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dol.gov/agencies/whd/overtime',
    structured_data: {
      type: 'overtime',
      federal: {
        threshold: 40,
        period: 'weekly',
        rate: 1.5,
      },
      california: {
        daily_threshold_1: 8,
        daily_rate_1: 1.5,
        daily_threshold_2: 12,
        daily_rate_2: 2.0,
        seventh_day: 1.5,
        seventh_day_after_8: 2.0,
      },
    },
  },
  // Contributions
  {
    jurisdiction: 'US',
    category: 'contributions',
    law_name: 'Social Security and Medicare (FICA)',
    description: 'FICA taxes fund Social Security and Medicare. Social Security: 6.2% employee + 6.2% employer (wage cap $168,600). Medicare: 1.45% each + 0.9% additional for high earners above $200,000.',
    effective_date: '2024-01-01',
    source_url: 'https://www.ssa.gov/oact/cola/cbb.html',
    structured_data: {
      type: 'social_security',
      name: 'FICA',
      social_security: {
        employee: 6.2,
        employer: 6.2,
        wage_cap: 168600,
      },
      medicare: {
        employee: 1.45,
        employer: 1.45,
        additional_tax: 0.9,
        additional_threshold: 200000,
      },
      currency: 'USD',
    },
  },
  {
    jurisdiction: 'US',
    category: 'contributions',
    law_name: '401(k) Retirement Plans',
    description: 'Employers may offer 401(k) plans for retirement savings. Employee contribution limit is $23,000 per year ($30,500 if 50+). Employer match is common but not required. Total combined limit is $69,000.',
    effective_date: '2024-01-01',
    source_url: 'https://www.irs.gov/retirement-plans/401k-plans',
    structured_data: {
      type: 'retirement',
      name: '401k',
      employee_limit: 23000,
      catch_up_limit: 7500,
      catch_up_age: 50,
      total_combined_limit: 69000,
      employer_match: 'Discretionary',
      vesting: 'Varies by plan',
      currency: 'USD',
    },
  },
  // Working Hours
  {
    jurisdiction: 'US',
    category: 'working_hours',
    law_name: 'Working Hours - No Federal Limit',
    description: 'FLSA does not limit work hours for employees 16+. Employers may require any number of hours. The standard workweek is 40 hours, beyond which overtime applies for non-exempt workers.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dol.gov/agencies/whd/flsa',
    structured_data: {
      type: 'working_hours',
      max_weekly_hours: null,
      standard_workweek: 40,
      overtime_threshold: 40,
      federal_limits: false,
    },
  },
  // Termination
  {
    jurisdiction: 'US',
    category: 'termination',
    law_name: 'At-Will Employment',
    description: 'Most US states follow at-will employment, meaning employers or employees can terminate the relationship at any time, for any reason (except illegal reasons), with or without notice.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dol.gov/general/topic/termination',
    structured_data: {
      type: 'termination',
      doctrine: 'At-Will',
      notice_required: false,
      exceptions: [
        'Discrimination (protected classes)',
        'Retaliation',
        'Public policy violation',
        'Employment contracts',
      ],
      states_with_exceptions: ['Montana'],
    },
  },
  {
    jurisdiction: 'US',
    category: 'termination',
    law_name: 'WARN Act - Mass Layoffs',
    description: 'The Worker Adjustment and Retraining Notification Act requires employers with 100+ employees to provide 60 days advance notice of plant closings and mass layoffs affecting 50+ workers.',
    effective_date: '2024-01-01',
    source_url: 'https://www.dol.gov/agencies/eta/layoffs/warn',
    structured_data: {
      type: 'termination',
      name: 'WARN Act',
      notice_days: 60,
      employer_size: 100,
      affected_workers: 50,
      applies_to: ['Plant closings', 'Mass layoffs'],
    },
  },
  // Benefits
  {
    jurisdiction: 'US',
    category: 'benefits',
    law_name: 'Affordable Care Act (ACA) Employer Mandate',
    description: 'Applicable Large Employers (ALEs) with 50+ full-time equivalent employees must offer affordable health insurance to full-time employees (30+ hours/week) or pay a penalty.',
    effective_date: '2024-01-01',
    source_url: 'https://www.healthcare.gov/employers/',
    structured_data: {
      type: 'health_insurance',
      name: 'ACA Employer Mandate',
      employer_size: 50,
      full_time_threshold: 30,
      affordability: '9.12% of household income',
      minimum_value: '60% of covered expenses',
      penalty_per_employee: 2970,
      currency: 'USD',
    },
  },
];

export async function seedLabourLaws(): Promise<void> {
  logger.info('Starting labour law seeding...');
  
  try {
    // Clear existing laws
    await LabourLawModel.deleteAll();
    logger.info('Cleared existing labour laws');

    // Seed all jurisdictions
    const allLaws = [...malaysiaLaws, ...singaporeLaws, ...ukLaws, ...usLaws];
    
    for (const law of allLaws) {
      await LabourLawModel.create(law);
    }
    
    logger.info(`Seeded ${allLaws.length} labour laws:`);
    logger.info(`  - Malaysia: ${malaysiaLaws.length} laws`);
    logger.info(`  - Singapore: ${singaporeLaws.length} laws`);
    logger.info(`  - UK: ${ukLaws.length} laws`);
    logger.info(`  - US: ${usLaws.length} laws`);
    
  } catch (error) {
    logger.error('Failed to seed labour laws:', error);
    throw error;
  }
}

export { malaysiaLaws, singaporeLaws, ukLaws, usLaws };

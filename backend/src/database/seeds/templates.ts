import { db } from '../../config/database.js';
import { logger } from '../../middleware/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { Jurisdiction } from '../../types/employee.types.js';
import { ContractType } from '../../types/contract.types.js';

interface ContractTemplateSeed {
  name: string;
  type: ContractType;
  jurisdiction: Jurisdiction;
  content: string;
  metadata: Record<string, unknown>;
}

// ============================================
// MALAYSIA CONTRACT TEMPLATES
// ============================================
const malaysiaTemplates: ContractTemplateSeed[] = [
  {
    name: 'Malaysia Employment Contract',
    type: 'employment_contract',
    jurisdiction: 'MY',
    content: `EMPLOYMENT CONTRACT

BETWEEN:
{{company_name}} (Company Registration No: {{company_reg}})
(hereinafter referred to as "the Employer")

AND:
{{employee_name}} (NRIC No: {{employee_nric}})
(hereinafter referred to as "the Employee")

1. COMMENCEMENT AND POSITION
1.1 The Employee shall be employed as {{job_title}} in the {{department}} department.
1.2 Employment shall commence on {{start_date}}.
1.3 The Employee shall report to {{manager_name}}.

2. PROBATION
2.1 The Employee shall serve a probationary period of {{probation_months}} months.
2.2 During probation, either party may terminate with {{probation_notice}} weeks notice.

3. REMUNERATION
3.1 The Employee shall receive a monthly salary of RM{{salary}} (Ringgit Malaysia).
3.2 Salary shall be paid on the {{pay_day}} of each month via bank transfer.

4. STATUTORY CONTRIBUTIONS
4.1 EPF (Employees Provident Fund):
    - Employee contribution: 11% of monthly wages
    - Employer contribution: {{epf_employer_rate}}% of monthly wages
    
4.2 SOCSO (Social Security Organization):
    - As per SOCSO Act 1969, contributions will be made to both:
      - Employment Injury Scheme
      - Invalidity Scheme
      
4.3 EIS (Employment Insurance System):
    - Employee: 0.2% of monthly wages
    - Employer: 0.2% of monthly wages

5. WORKING HOURS
5.1 Normal working hours are {{work_hours}} hours per week.
5.2 Working days are {{work_days}}.
5.3 The Employee is entitled to one rest day per week.

6. LEAVE ENTITLEMENTS
6.1 Annual Leave: As per Employment Act 1955
    - Less than 2 years service: 8 days
    - 2 to 5 years service: 12 days
    - More than 5 years service: 16 days
    
6.2 Sick Leave: As per Employment Act 1955
    - Less than 2 years: 14 days
    - 2 to 5 years: 18 days
    - More than 5 years: 22 days
    - Hospitalization leave: 60 days per year

6.3 Maternity Leave: 98 consecutive days (for eligible female employees)
6.4 Paternity Leave: 7 days (for eligible male employees)
6.5 Public Holidays: 11 gazetted public holidays per year

7. TERMINATION
7.1 After probation, notice period required:
    - Less than 2 years service: {{notice_weeks_1}} weeks
    - 2 to 5 years service: {{notice_weeks_2}} weeks
    - More than 5 years service: {{notice_weeks_3}} weeks

7.2 Either party may terminate by providing notice or payment in lieu of notice.

8. CONFIDENTIALITY
8.1 The Employee shall maintain strict confidentiality of all company information.
8.2 This obligation continues after termination of employment.

9. GOVERNING LAW
9.1 This contract is governed by the laws of Malaysia.
9.2 The Employment Act 1955 shall apply where applicable.

SIGNED:

________________________          ________________________
For and on behalf of               Employee
{{company_name}}

Date: _______________             Date: _______________`,
    metadata: {
      required_fields: ['employee_name', 'employee_nric', 'job_title', 'department', 'start_date', 'salary'],
      optional_fields: ['probation_months', 'probation_notice', 'manager_name'],
      defaults: {
        probation_months: 3,
        probation_notice: 1,
        work_hours: 45,
        work_days: 'Monday to Friday',
        notice_weeks_1: 4,
        notice_weeks_2: 6,
        notice_weeks_3: 8,
        epf_employer_rate: 12,
        pay_day: '25th',
      },
    },
  },
];

// ============================================
// SINGAPORE CONTRACT TEMPLATES  
// ============================================
const singaporeTemplates: ContractTemplateSeed[] = [
  {
    name: 'Singapore Employment Contract',
    type: 'employment_contract',
    jurisdiction: 'SG',
    content: `EMPLOYMENT CONTRACT

PARTIES:
1. {{company_name}} (UEN: {{company_uen}}) ("Employer")
2. {{employee_name}} (NRIC/FIN: {{employee_id}}) ("Employee")

1. APPOINTMENT
1.1 Position: {{job_title}}
1.2 Department: {{department}}
1.3 Commencement Date: {{start_date}}
1.4 Reporting To: {{manager_name}}
1.5 Work Location: {{work_location}}

2. PROBATION
2.1 Probationary period: {{probation_months}} months
2.2 Notice during probation: {{probation_notice}} week(s)
2.3 Confirmation subject to satisfactory performance

3. REMUNERATION
3.1 Basic Monthly Salary: S\${{salary}}
3.2 Payment: By {{pay_day}} of each month via GIRO

4. CPF CONTRIBUTIONS
4.1 Central Provident Fund contributions will be made in accordance with the CPF Act.
4.2 Current rates (subject to change by CPF Board):
    {{#if age_below_55}}
    - Employee: 20% of Ordinary Wages (up to OW ceiling of S$6,800)
    - Employer: 17% of Ordinary Wages
    {{/if}}

5. WORKING HOURS
5.1 Standard work week: {{work_hours}} hours
5.2 Working days: {{work_days}}
5.3 Overtime: In accordance with the Employment Act (where applicable)

6. LEAVE ENTITLEMENTS
6.1 Annual Leave:
    - Year 1: 7 days
    - Year 2: 8 days (increasing by 1 day each year to maximum 14 days)
    
6.2 Sick Leave (after 3 months service):
    - Outpatient: 14 days per year
    - Hospitalization: 60 days per year (inclusive of outpatient)
    
6.3 Maternity Leave: 16 weeks (Government-Paid Maternity Leave for eligible employees)
6.4 Paternity Leave: 2 weeks (Government-Paid Paternity Leave for eligible employees)
6.5 Childcare Leave: 6 days per year (for children under 7 years)
6.6 Public Holidays: 11 gazetted public holidays

7. TERMINATION
7.1 Notice Period (after confirmation):
    - By either party: {{notice_period}} month(s)
7.2 Payment in lieu of notice may be made

8. CONFIDENTIALITY AND NON-DISCLOSURE
8.1 All confidential information remains property of the Employer
8.2 Obligations continue after termination

9. INTELLECTUAL PROPERTY
9.1 All IP created during employment belongs to the Employer

10. GOVERNING LAW
10.1 This contract is governed by the laws of the Republic of Singapore
10.2 The Employment Act shall apply where applicable

IN WITNESS WHEREOF the parties have signed this Contract:

_________________________          _________________________
For: {{company_name}}              Employee: {{employee_name}}
Name:                              NRIC/FIN: {{employee_id}}
Title:

Date: _______________             Date: _______________`,
    metadata: {
      required_fields: ['employee_name', 'employee_id', 'job_title', 'department', 'start_date', 'salary'],
      optional_fields: ['work_location', 'manager_name'],
      defaults: {
        probation_months: 3,
        probation_notice: 1,
        notice_period: 1,
        work_hours: 44,
        work_days: 'Monday to Friday',
        pay_day: 'the last working day',
      },
    },
  },
];

// ============================================
// UK CONTRACT TEMPLATES
// ============================================
const ukTemplates: ContractTemplateSeed[] = [
  {
    name: 'UK Employment Contract',
    type: 'employment_contract',
    jurisdiction: 'UK',
    content: `STATEMENT OF MAIN TERMS AND CONDITIONS OF EMPLOYMENT

EMPLOYER: {{company_name}}
Registered Office: {{company_address}}
Company Number: {{company_number}}

EMPLOYEE: {{employee_name}}
Address: {{employee_address}}

1. JOB TITLE AND DUTIES
1.1 You are employed as: {{job_title}}
1.2 Department: {{department}}
1.3 You will report to: {{manager_name}}
1.4 Your normal place of work is: {{work_location}}

2. COMMENCEMENT AND CONTINUOUS EMPLOYMENT
2.1 Your employment commences on: {{start_date}}
2.2 Your continuous employment began on: {{start_date}}
2.3 This is a {{contract_type}} contract

3. PROBATIONARY PERIOD
3.1 You will serve a probationary period of {{probation_months}} months
3.2 During this period, notice required is {{probation_notice}} week(s)

4. REMUNERATION
4.1 Your salary is £{{salary}} per annum (gross)
4.2 Payment is made monthly in arrears on {{pay_day}}
4.3 Payment is by BACS transfer to your nominated bank account

5. HOURS OF WORK
5.1 Your normal hours of work are {{work_hours}} hours per week
5.2 Working days: {{work_days}}
5.3 You may be required to work additional hours as necessary
5.4 You have the right to opt out of the 48-hour working week limit

6. ANNUAL LEAVE
6.1 You are entitled to {{annual_leave}} days paid holiday per year
6.2 The holiday year runs from {{holiday_year_start}} to {{holiday_year_end}}
6.3 Bank holidays are {{bank_holidays_included}} in this entitlement
6.4 Unused leave cannot be carried forward except with written approval

7. SICKNESS ABSENCE
7.1 If absent due to illness, notify your manager before {{absence_notify_time}}
7.2 Statutory Sick Pay (SSP) is payable in accordance with legislation
7.3 Company Sick Pay (if applicable): {{company_sick_pay}}
7.4 Self-certification is required for absence up to 7 days
7.5 A Fit Note is required for absence exceeding 7 days

8. PENSION
8.1 You will be auto-enrolled into the company pension scheme
8.2 Minimum contributions: Employee {{pension_employee}}%, Employer {{pension_employer}}%
8.3 You may opt out within one month of enrolment

9. NOTICE PERIOD
9.1 After probation, notice required from either party:
    - {{notice_period_employee}} month(s) from Employee
    - {{notice_period_employer}} month(s) from Employer (or statutory minimum if greater)

10. DISCIPLINARY AND GRIEVANCE
10.1 Disciplinary and grievance procedures are set out in the Employee Handbook
10.2 These do not form part of your contract of employment

11. DATA PROTECTION
11.1 Your personal data will be processed in accordance with our Privacy Notice

12. GOVERNING LAW
12.1 This contract is governed by the laws of England and Wales

ACCEPTANCE
I confirm that I have read, understood and accept the terms of this contract.

_________________________          _________________________
Signed for: {{company_name}}       Employee Signature

Name:                              Print Name: {{employee_name}}
Position:                          
Date: _______________             Date: _______________`,
    metadata: {
      required_fields: ['employee_name', 'employee_address', 'job_title', 'department', 'start_date', 'salary'],
      optional_fields: ['work_location', 'manager_name', 'annual_leave'],
      defaults: {
        probation_months: 6,
        probation_notice: 1,
        contract_type: 'permanent',
        work_hours: 37.5,
        work_days: 'Monday to Friday',
        annual_leave: 25,
        holiday_year_start: '1 January',
        holiday_year_end: '31 December',
        bank_holidays_included: 'in addition to',
        absence_notify_time: '10:00am',
        company_sick_pay: 'As per Company Sick Pay policy',
        pension_employee: 5,
        pension_employer: 3,
        notice_period_employee: 1,
        notice_period_employer: 1,
        pay_day: 'the last working day of each month',
      },
    },
  },
];

// ============================================
// US CONTRACT TEMPLATES
// ============================================
const usTemplates: ContractTemplateSeed[] = [
  {
    name: 'US Employment Agreement (At-Will)',
    type: 'employment_contract',
    jurisdiction: 'US',
    content: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of {{start_date}} between:

EMPLOYER: {{company_name}}
Address: {{company_address}}

EMPLOYEE: {{employee_name}}
Address: {{employee_address}}

1. EMPLOYMENT
1.1 Position: The Company agrees to employ you as {{job_title}} in the {{department}} department.
1.2 Duties: You will perform duties as assigned and report to {{manager_name}}.
1.3 Location: Your primary work location will be {{work_location}}.

2. AT-WILL EMPLOYMENT
2.1 Your employment is "at-will." This means that either you or the Company may terminate employment at any time, with or without cause or notice.
2.2 Nothing in this Agreement creates a contract of employment for any specific period.
2.3 Only the CEO may modify the at-will nature of your employment, and only in writing.

3. COMPENSATION
3.1 Base Salary: \${{salary}} per year, paid {{pay_frequency}} via direct deposit
3.2 You are classified as {{flsa_status}} under the Fair Labor Standards Act
{{#if exempt}}
3.3 As an exempt employee, you are not eligible for overtime pay
{{else}}
3.3 As a non-exempt employee, you will receive overtime pay at 1.5x your regular rate for hours worked over 40 per week
{{/if}}

4. BENEFITS
4.1 You are eligible to participate in Company benefit plans, subject to plan terms:
    - Health, dental, and vision insurance (effective {{benefits_start}})
    - 401(k) retirement plan with {{match_percentage}}% company match
    - Paid Time Off (PTO): {{pto_days}} days per year
    - {{additional_benefits}}

4.2 The Company reserves the right to modify or terminate benefit plans at any time.

5. WORK SCHEDULE
5.1 Standard work hours: {{work_hours}} hours per week
5.2 Working days: {{work_days}}
{{#if remote_eligible}}
5.3 Remote work: You are eligible for {{remote_policy}}
{{/if}}

6. CONFIDENTIALITY
6.1 You agree to maintain the confidentiality of all proprietary information
6.2 This obligation survives termination of employment
6.3 You will sign the Company's standard Confidentiality Agreement

7. INTELLECTUAL PROPERTY
7.1 All work product created during your employment belongs to the Company

8. NON-SOLICITATION
8.1 For {{non_solicit_period}} months following termination, you agree not to:
    - Solicit Company employees
    - Solicit Company customers with whom you had contact

9. COMPLIANCE
9.1 You agree to comply with all Company policies and applicable laws
9.2 You certify that you are legally authorized to work in the United States

10. ENTIRE AGREEMENT
10.1 This Agreement and the attached documents constitute the entire agreement
10.2 This Agreement supersedes all prior understandings

11. GOVERNING LAW
11.1 This Agreement is governed by the laws of the State of {{state}}

ACKNOWLEDGED AND AGREED:

COMPANY:                           EMPLOYEE:
{{company_name}}

_________________________         _________________________
By:                                {{employee_name}}
Title:
Date: _______________             Date: _______________`,
    metadata: {
      required_fields: ['employee_name', 'employee_address', 'job_title', 'department', 'start_date', 'salary', 'state'],
      optional_fields: ['work_location', 'manager_name', 'remote_policy'],
      defaults: {
        pay_frequency: 'bi-weekly',
        flsa_status: 'exempt',
        benefits_start: 'the first of the month following 30 days of employment',
        match_percentage: 4,
        pto_days: 15,
        additional_benefits: 'Life insurance, disability insurance',
        work_hours: 40,
        work_days: 'Monday to Friday',
        remote_eligible: true,
        remote_policy: 'hybrid work (3 days office, 2 days remote)',
        non_solicit_period: 12,
        state: 'California',
      },
    },
  },
];

// ============================================
// EQUITY GRANT TEMPLATE
// ============================================
const equityTemplates: ContractTemplateSeed[] = [
  {
    name: 'Stock Option Grant Letter',
    type: 'equity_grant',
    jurisdiction: 'US',
    content: `STOCK OPTION GRANT NOTICE

{{company_name}}
{{date}}

Dear {{employee_name}},

We are pleased to inform you that you have been granted a stock option under the {{company_name}} Equity Incentive Plan ("Plan").

GRANT DETAILS:

Optionee: {{employee_name}}
Grant Date: {{grant_date}}
Number of Shares: {{total_shares}}
Exercise Price per Share: \${{strike_price}}
Total Exercise Price: \${{total_exercise_price}}
Option Type: {{option_type}}
Expiration Date: {{expiration_date}}

VESTING SCHEDULE:

Your option will vest according to the following schedule:
- Cliff Period: {{cliff_months}} months ({{cliff_percentage}}% vests at cliff)
- Remaining vesting: Monthly over {{remaining_months}} months
- Total vesting period: {{total_months}} months

Vesting Commencement Date: {{vesting_start_date}}

EXERCISE:

Once vested, you may exercise your option by:
1. Delivering a completed Exercise Agreement
2. Paying the exercise price
3. Satisfying any tax withholding requirements

TERMINATION:

If your employment terminates:
- Voluntary resignation: {{termination_exercise_period_voluntary}} days to exercise vested options
- Termination without cause: {{termination_exercise_period_without_cause}} days to exercise vested options
- For cause: Immediate forfeiture of all options

IMPORTANT NOTES:

- This grant is subject to the terms of the Plan
- Tax consequences may apply - consult a tax advisor
- The Company is not providing tax, legal, or investment advice

By signing below, you acknowledge receipt of this Grant Notice and agree to the terms of the Plan.

___________________________          ___________________________
{{employee_name}}                    {{company_name}}
Date: _______________               By: _______________
                                    Title: _______________`,
    metadata: {
      required_fields: ['employee_name', 'grant_date', 'total_shares', 'strike_price'],
      optional_fields: ['option_type', 'cliff_months'],
      defaults: {
        option_type: 'Incentive Stock Option (ISO)',
        cliff_months: 12,
        cliff_percentage: 25,
        remaining_months: 36,
        total_months: 48,
        termination_exercise_period_voluntary: 90,
        termination_exercise_period_without_cause: 90,
      },
    },
  },
];

export async function seedContractTemplates(): Promise<void> {
  logger.info('Starting contract template seeding...');
  
  try {
    // Clear existing templates
    await db.none('DELETE FROM contract_templates');
    logger.info('Cleared existing contract templates');

    const allTemplates = [
      ...malaysiaTemplates,
      ...singaporeTemplates,
      ...ukTemplates,
      ...usTemplates,
      ...equityTemplates,
    ];

    for (const template of allTemplates) {
      const id = uuidv4();
      await db.none(`
        INSERT INTO contract_templates (id, name, type, jurisdiction, content, metadata, version, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, 1, true)
      `, [id, template.name, template.type, template.jurisdiction, template.content, JSON.stringify(template.metadata)]);
    }
    
    logger.info(`Seeded ${allTemplates.length} contract templates:`);
    logger.info(`  - Malaysia: ${malaysiaTemplates.length}`);
    logger.info(`  - Singapore: ${singaporeTemplates.length}`);
    logger.info(`  - UK: ${ukTemplates.length}`);
    logger.info(`  - US: ${usTemplates.length}`);
    logger.info(`  - Equity: ${equityTemplates.length}`);
    
  } catch (error) {
    logger.error('Failed to seed contract templates:', error);
    throw error;
  }
}

export { malaysiaTemplates, singaporeTemplates, ukTemplates, usTemplates, equityTemplates };

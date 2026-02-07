"""Test configuration"""
import pytest

@pytest.fixture
def sample_employee_data():
    """Fixture for sample employee data"""
    return {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@company.com",
        "position": "Software Engineer",
        "department": "Engineering",
        "employment_type": "full_time",
        "start_date": "2024-01-15",
        "salary": 100000.0,
        "currency": "USD",
        "location": "San Francisco, CA",
        "jurisdiction": "United States"
    }

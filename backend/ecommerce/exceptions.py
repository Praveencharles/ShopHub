from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        errors = []
        if isinstance(response.data, dict):
            for field, messages in response.data.items():
                if isinstance(messages, list):
                    for msg in messages:
                        errors.append({'field': field, 'message': str(msg)})
                else:
                    errors.append({'field': field, 'message': str(messages)})
        response.data = {
            'success': False,
            'status_code': response.status_code,
            'errors': errors,
            'message': 'Validation error' if response.status_code == 400 else str(response.data.get('detail', 'Error occurred'))
        }
    return response

def create_error_response(status_code, message, errors=None):
    return Response({
        'success': False,
        'status_code': status_code,
        'message': message,
        'errors': errors or []
    }, status=status_code)

import sys
import os

_services_dir = os.path.dirname(os.path.abspath(__file__))
_app_dir = os.path.dirname(_services_dir)
if _app_dir not in sys.path:
    sys.path.insert(0, _app_dir)
